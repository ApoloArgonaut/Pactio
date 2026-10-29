import { createHmac, createHash, randomBytes, randomInt, timingSafeEqual } from 'crypto';

/**
 * Entropía en bytes para el nonce aleatorio del Magic Link (256 bits = 32 bytes).
 */
export const MAGIC_LINK_NONCE_BYTES = 32;

/**
 * TTL por defecto para Magic Links de revisión (72 horas en milisegundos).
 */
export const DEFAULT_MAGIC_LINK_TTL_MS = 72 * 60 * 60 * 1000;

/**
 * Umbral estricto de Rate Limiting para Magic Links y OTPs:
 * Máximo 5 intentos fallidos por ventana de 15 minutos.
 */
export const MAX_AUTH_ATTEMPTS = 5;
export const AUTH_WINDOW_MS = 15 * 60 * 1000;       // 15 minutos
export const AUTH_LOCKOUT_MS = 60 * 60 * 1000;      // 1 hora de bloqueo tras rebasar umbral

/**
 * Encabezados HTTP requeridos para el Patrón "Zero-Click Immunity" y prevención
 * de fuga de tokens o indexación en motores de búsqueda (Google, Bing, bots de correo).
 */
export const ZERO_CLICK_ANTI_BOT_HEADERS: Record<string, string> = {
  'Referrer-Policy': 'no-referrer',
  'X-Robots-Tag': 'noindex, nofollow, noarchive',
  'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
  'Pragma': 'no-cache',
  'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; frame-ancestors 'none';"
};

export interface MagicLinkPayload {
  contractId: string;
  contractCode: string;
  recipientEmail: string;
  role: 'creator' | 'client';
  nonce: string; // 256 bits CSPRNG
  iat: number;   // Timestamp Unix en milisegundos
  exp: number;   // Timestamp de expiración
}

export interface GeneratedMagicLink {
  rawToken: string;
  tokenHash: string; // SHA-256(rawToken) para almacenamiento Zero-Knowledge en DB
  url: string;
  expiresAt: string;
}

export interface RateLimitStatus {
  allowed: boolean;
  remainingAttempts: number;
  retryAfterSeconds: number;
}

/**
 * Comparación segura en tiempo constante de buffers/strings.
 */
function timingSafeStringEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a, 'utf8');
  const bufB = Buffer.from(b, 'utf8');
  if (bufA.length !== bufB.length) {
    timingSafeEqual(bufA, bufA);
    return false;
  }
  return timingSafeEqual(bufA, bufB);
}

/**
 * Clase Gestora de Rate Limiting con Ventana Deslizante y Bloqueo Temporal.
 * Previene ataques de fuerza bruta y enumeración sobre Magic Links y OTPs.
 */
export class RateLimiter {
  private attempts = new Map<string, { count: number; windowStart: number; blockedUntil?: number }>();

  constructor(
    private maxAttempts: number = MAX_AUTH_ATTEMPTS,
    private windowMs: number = AUTH_WINDOW_MS,
    private lockoutMs: number = AUTH_LOCKOUT_MS
  ) {}

  public check(key: string): RateLimitStatus {
    const now = Date.now();
    const record = this.attempts.get(key);

    if (!record) {
      return { allowed: true, remainingAttempts: this.maxAttempts, retryAfterSeconds: 0 };
    }

    // Verificar si está en periodo de bloqueo
    if (record.blockedUntil && now < record.blockedUntil) {
      const retryAfterSeconds = Math.ceil((record.blockedUntil - now) / 1000);
      return { allowed: false, remainingAttempts: 0, retryAfterSeconds };
    }

    // Si expiró la ventana, reiniciar contador
    if (now - record.windowStart > this.windowMs) {
      this.attempts.delete(key);
      return { allowed: true, remainingAttempts: this.maxAttempts, retryAfterSeconds: 0 };
    }

    const remaining = Math.max(0, this.maxAttempts - record.count);
    return {
      allowed: record.count < this.maxAttempts,
      remainingAttempts: remaining,
      retryAfterSeconds: record.count >= this.maxAttempts ? Math.ceil((record.windowStart + this.windowMs - now) / 1000) : 0
    };
  }

  public recordFailure(key: string): RateLimitStatus {
    const now = Date.now();
    const record = this.attempts.get(key);

    if (!record || (now - record.windowStart > this.windowMs && !record.blockedUntil)) {
      this.attempts.set(key, { count: 1, windowStart: now });
      return { allowed: true, remainingAttempts: this.maxAttempts - 1, retryAfterSeconds: 0 };
    }

    record.count += 1;

    if (record.count >= this.maxAttempts) {
      record.blockedUntil = now + this.lockoutMs;
      const retryAfterSeconds = Math.ceil(this.lockoutMs / 1000);
      return { allowed: false, remainingAttempts: 0, retryAfterSeconds };
    }

    const remaining = Math.max(0, this.maxAttempts - record.count);
    return { allowed: true, remainingAttempts: remaining, retryAfterSeconds: 0 };
  }

  public recordSuccess(key: string): void {
    this.attempts.delete(key);
  }

  public reset(key: string): void {
    this.attempts.delete(key);
  }

  public clearAll(): void {
    this.attempts.clear();
  }
}

/**
 * Servicio Criptográfico de Magic Links Efímeros y Desafíos OTP.
 */
export class MagicLinkService {
  private secretKey: string;
  private revokedHashes = new Set<string>();
  private rateLimiter: RateLimiter;
  private activeOtps = new Map<string, { hash: string; expiresAt: number; attempts: number }>();

  constructor(secretKey: string = process.env.MAGIC_LINK_SECRET || 'pactio-dev-secret-key-32bytes-long-min') {
    this.secretKey = secretKey;
    this.rateLimiter = new RateLimiter();
  }

  /**
   * Genera un Magic Link seguro firmado con HMAC-SHA256 y un nonce CSPRNG de 256 bits.
   * La base de datos NUNCA almacena el token en claro, únicamente su SHA-256.
   */
  public generateLink(params: {
    contractId: string;
    contractCode: string;
    recipientEmail: string;
    role: 'creator' | 'client';
    baseUrl?: string;
    ttlMs?: number;
  }): GeneratedMagicLink {
    const now = Date.now();
    const ttl = params.ttlMs || DEFAULT_MAGIC_LINK_TTL_MS;
    const expiresAtMs = now + ttl;

    const nonce = randomBytes(MAGIC_LINK_NONCE_BYTES).toString('hex');

    const payload: MagicLinkPayload = {
      contractId: params.contractId,
      contractCode: params.contractCode,
      recipientEmail: params.recipientEmail,
      role: params.role,
      nonce,
      iat: now,
      exp: expiresAtMs
    };

    const serializedPayload = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
    const signature = createHmac('sha256', this.secretKey)
      .update(serializedPayload)
      .digest('base64url');

    const rawToken = `${serializedPayload}.${signature}`;
    const tokenHash = createHash('sha256').update(rawToken, 'utf8').digest('hex');

    const baseUrl = params.baseUrl || 'https://app.pactio.lat';
    const url = `${baseUrl}/c/review?auth=${rawToken}`;

    return {
      rawToken,
      tokenHash,
      url,
      expiresAt: new Date(expiresAtMs).toISOString()
    };
  }

  /**
   * Verifica la autenticidad, integridad y vigencia de un Magic Link.
   * Aplica comparación en tiempo constante (timing attack protection).
   */
  public verifyToken(rawToken: string, clientIp: string = '127.0.0.1'): {
    valid: boolean;
    payload?: MagicLinkPayload;
    tokenHash?: string;
    reason?: string;
  } {
    // 1. Verificar Rate Limit del cliente
    const rlStatus = this.rateLimiter.check(clientIp);
    if (!rlStatus.allowed) {
      return {
        valid: false,
        reason: `Rate limit excedido: Demasiados intentos fallidos. Reintente en ${rlStatus.retryAfterSeconds} segundos.`
      };
    }

    if (!rawToken || typeof rawToken !== 'string') {
      this.rateLimiter.recordFailure(clientIp);
      return { valid: false, reason: 'Token de acceso ausente o formato no válido.' };
    }

    const parts = rawToken.split('.');
    if (parts.length !== 2) {
      this.rateLimiter.recordFailure(clientIp);
      return { valid: false, reason: 'Estructura de token JWT/HMAC malformada.' };
    }

    const [serializedPayload, providedSignature] = parts;

    // 2. Verificar firma HMAC-SHA256 con tiempo constante
    const expectedSignature = createHmac('sha256', this.secretKey)
      .update(serializedPayload)
      .digest('base64url');

    if (!timingSafeStringEqual(providedSignature, expectedSignature)) {
      this.rateLimiter.recordFailure(clientIp);
      return { valid: false, reason: 'Firma criptográfica inválida: Manipulación de token detectada.' };
    }

    // 3. Decodificar payload
    let payload: MagicLinkPayload;
    try {
      const decodedJson = Buffer.from(serializedPayload, 'base64url').toString('utf8');
      payload = JSON.parse(decodedJson);
    } catch {
      this.rateLimiter.recordFailure(clientIp);
      return { valid: false, reason: 'Payload JSON ilegible o corrupto.' };
    }

    // 4. Calcular hash para comprobar revocaciones
    const tokenHash = createHash('sha256').update(rawToken, 'utf8').digest('hex');
    if (this.revokedHashes.has(tokenHash)) {
      return { valid: false, reason: 'El enlace ha sido revocado tras la firma o cancelación del acuerdo.' };
    }

    // 5. Verificar TTL (Expiración a 72h)
    const now = Date.now();
    if (now > payload.exp) {
      return { valid: false, reason: 'El enlace mágico ha caducado por motivos de seguridad (TTL expirado).' };
    }

    // Éxito: Limpiar fallos de IP
    this.rateLimiter.recordSuccess(clientIp);

    return {
      valid: true,
      payload,
      tokenHash
    };
  }

  /**
   * Revoca un token en cascada (ej. cuando el contrato ha sido firmado o cancelado).
   */
  public revokeToken(tokenHash: string): void {
    this.revokedHashes.add(tokenHash);
  }

  /**
   * Comprueba si una petición GET puede mutar el estado del contrato.
   * Por diseño Zero-Click Anti-Bot, una petición GET NUNCA muta el estado.
   */
  public canMutateStateOnGet(): boolean {
    return false;
  }

  /**
   * Retorna los encabezados anti-crawler y anti-leak para la página de aterrizaje del Magic Link.
   */
  public getAntiBotHeaders(): Record<string, string> {
    return { ...ZERO_CLICK_ANTI_BOT_HEADERS };
  }

  /**
   * Genera un OTP numérico de 6 dígitos mediante CSPRNG (desafío secundario ante anomalías de IP).
   * Almacena únicamente el hash SHA-256 del OTP.
   */
  public generateOtp(identifier: string, ttlMs: number = 10 * 60 * 1000): { otp: string; expiresAt: number } {
    // Generación CSPRNG de 6 dígitos (100000 - 999999)
    const code = randomInt(100000, 1000000).toString();
    const hash = createHash('sha256').update(code, 'utf8').digest('hex');
    const expiresAt = Date.now() + ttlMs;

    this.activeOtps.set(identifier, {
      hash,
      expiresAt,
      attempts: 0
    });

    return { otp: code, expiresAt };
  }

  /**
   * Valida un OTP de 6 dígitos con protección contra fuerza bruta y tiempo constante.
   * Máximo 5 intentos antes de invalidar el código.
   */
  public verifyOtp(identifier: string, candidateOtp: string): { valid: boolean; reason?: string } {
    // 1. Rate limiter global para el identificador
    const rlStatus = this.rateLimiter.check(`otp:${identifier}`);
    if (!rlStatus.allowed) {
      return {
        valid: false,
        reason: `Bloqueo de seguridad: Demasiados intentos de OTP. Reintente en ${rlStatus.retryAfterSeconds} segundos.`
      };
    }

    const record = this.activeOtps.get(identifier);
    if (!record) {
      this.rateLimiter.recordFailure(`otp:${identifier}`);
      return { valid: false, reason: 'No existe ningún código OTP activo para este firmante.' };
    }

    if (Date.now() > record.expiresAt) {
      this.activeOtps.delete(identifier);
      return { valid: false, reason: 'El código OTP ha expirado (validez de 10 minutos).' };
    }

    record.attempts += 1;

    // Calcular hash del candidato y comparar en tiempo constante
    const candidateHash = createHash('sha256').update(candidateOtp.trim(), 'utf8').digest('hex');
    const isMatch = timingSafeStringEqual(candidateHash, record.hash);

    if (!isMatch) {
      this.rateLimiter.recordFailure(`otp:${identifier}`);

      if (record.attempts >= MAX_AUTH_ATTEMPTS) {
        this.activeOtps.delete(identifier);
        return {
          valid: false,
          reason: 'Código incorrecto. Has superado el límite de 5 intentos; el código ha sido destruido por seguridad.'
        };
      }

      const remaining = MAX_AUTH_ATTEMPTS - record.attempts;
      return {
        valid: false,
        reason: `Código OTP incorrecto. Te restan ${remaining} intento(s).`
      };
    }

    // Éxito: Consumir código (Single-Use Burn) y limpiar rate limiter
    this.activeOtps.delete(identifier);
    this.rateLimiter.recordSuccess(`otp:${identifier}`);

    return { valid: true };
  }

  public getRateLimiter(): RateLimiter {
    return this.rateLimiter;
  }
}

export const magicLinkService = new MagicLinkService();
