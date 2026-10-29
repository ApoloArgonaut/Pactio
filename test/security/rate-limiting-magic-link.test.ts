import { describe, it, expect, beforeEach } from 'vitest';
import {
  MagicLinkService,
  RateLimiter,
  ZERO_CLICK_ANTI_BOT_HEADERS,
  MAX_AUTH_ATTEMPTS,
  AUTH_WINDOW_MS
} from '../../src/core/auth/magic-link.js';

describe('AppSec Audit: Magic Links Efímeros, Zero-Click Anti-Bot y Rate Limiting', () => {
  let magicLinkService: MagicLinkService;

  beforeEach(() => {
    magicLinkService = new MagicLinkService('test-secret-key-for-audit-minimum-32-bytes');
  });

  describe('Criptografía de Tokens HMAC-SHA256 y Entropía', () => {
    it('debe generar tokens con nonce CSPRNG de 256 bits (32 bytes) y firma válida', () => {
      const link = magicLinkService.generateLink({
        contractId: 'c-12345',
        contractCode: 'PACT-AUTH1',
        recipientEmail: 'cliente@novatech.mx',
        role: 'client'
      });

      expect(link.rawToken).toBeDefined();
      expect(link.tokenHash).toMatch(/^[0-9a-f]{64}$/);
      expect(link.url).toContain('/c/review?auth=');

      // Verificar que el token consta de payload en base64url y firma HMAC
      const parts = link.rawToken.split('.');
      expect(parts.length).toBe(2);

      // Decodificar payload para auditar nonce
      const payloadJson = Buffer.from(parts[0], 'base64url').toString('utf8');
      const payload = JSON.parse(payloadJson);
      expect(payload.nonce).toHaveLength(64); // 32 bytes hex = 64 chars
      expect(payload.role).toBe('client');
      expect(payload.recipientEmail).toBe('cliente@novatech.mx');
    });

    it('debe verificar exitosamente un token íntegro y vigente', () => {
      const link = magicLinkService.generateLink({
        contractId: 'c-12345',
        contractCode: 'PACT-AUTH2',
        recipientEmail: 'cliente@novatech.mx',
        role: 'client'
      });

      const verification = magicLinkService.verifyToken(link.rawToken, '192.168.1.100');
      expect(verification.valid).toBe(true);
      expect(verification.payload?.contractCode).toBe('PACT-AUTH2');
      expect(verification.tokenHash).toBe(link.tokenHash);
    });

    it('debe rechazar tokens con firma manipulada (Tampering en URL)', () => {
      const link = magicLinkService.generateLink({
        contractId: 'c-12345',
        contractCode: 'PACT-AUTH3',
        recipientEmail: 'cliente@novatech.mx',
        role: 'client'
      });

      // Alterar un solo carácter de la firma
      const [payload, sig] = link.rawToken.split('.');
      const alteredSig = sig.slice(0, -1) + (sig.endsWith('A') ? 'B' : 'A');
      const tamperedToken = `${payload}.${alteredSig}`;

      const verification = magicLinkService.verifyToken(tamperedToken, '10.0.0.1');
      expect(verification.valid).toBe(false);
      expect(verification.reason).toContain('Firma criptográfica inválida');
    });

    it('debe rechazar tokens con expiración vencida (TTL > 72h)', () => {
      // Generar enlace con TTL negativo (ya expirado)
      const link = magicLinkService.generateLink({
        contractId: 'c-12345',
        contractCode: 'PACT-EXP1',
        recipientEmail: 'cliente@novatech.mx',
        role: 'client',
        ttlMs: -1000 // Expirado hace 1 segundo
      });

      const verification = magicLinkService.verifyToken(link.rawToken, '10.0.0.2');
      expect(verification.valid).toBe(false);
      expect(verification.reason).toContain('ha caducado por motivos de seguridad');
    });

    it('debe respetar la revocación en cascada post-firma', () => {
      const link = magicLinkService.generateLink({
        contractId: 'c-12345',
        contractCode: 'PACT-REV1',
        recipientEmail: 'cliente@novatech.mx',
        role: 'client'
      });

      // Revocar token al completar la firma
      magicLinkService.revokeToken(link.tokenHash);

      const verification = magicLinkService.verifyToken(link.rawToken, '10.0.0.3');
      expect(verification.valid).toBe(false);
      expect(verification.reason).toContain('ha sido revocado');
    });
  });

  describe('Patrón Zero-Click Anti-Bot (Inmunidad a Escáneres de Correo)', () => {
    it('debe prohibir mutación de estado en peticiones HTTP GET', () => {
      // Los antivirus y crawlers (Safe Links, Defender) abren los links con GET
      expect(magicLinkService.canMutateStateOnGet()).toBe(false);
    });

    it('debe proveer encabezados estrictos contra fuga de referrer e indexación de robots', () => {
      const headers = magicLinkService.getAntiBotHeaders();

      expect(headers['Referrer-Policy']).toBe('no-referrer');
      expect(headers['X-Robots-Tag']).toContain('noindex');
      expect(headers['X-Robots-Tag']).toContain('nofollow');
      expect(headers['Cache-Control']).toContain('no-store');
      expect(headers['Content-Security-Policy']).toContain("default-src 'self'");
    });
  });

  describe('Rate Limiting y Prevención de Fuerza Bruta', () => {
    it('debe permitir hasta 5 intentos fallidos y bloquear al 6to intento consecutivo', () => {
      const clientIp = '203.0.113.42'; // IP atacante de prueba
      const limiter = new RateLimiter(5, 15 * 60 * 1000, 60 * 60 * 1000);

      // Primeros 4 intentos fallidos: Permitidos con conteo decreciente
      for (let i = 1; i <= 4; i++) {
        const res = limiter.recordFailure(clientIp);
        expect(res.allowed).toBe(true);
        expect(res.remainingAttempts).toBe(5 - i);
      }

      // 5to intento fallido: Último antes de bloqueo
      const fifth = limiter.recordFailure(clientIp);
      expect(fifth.allowed).toBe(false);
      expect(fifth.remainingAttempts).toBe(0);
      expect(fifth.retryAfterSeconds).toBeGreaterThan(0);

      // Verificación directa de bloqueo
      const check = limiter.check(clientIp);
      expect(check.allowed).toBe(false);
      expect(check.retryAfterSeconds).toBeGreaterThan(0);
    });

    it('debe reiniciar el contador de rate limit tras una autenticación exitosa', () => {
      const clientIp = '203.0.113.99';
      const limiter = new RateLimiter(5);

      limiter.recordFailure(clientIp);
      limiter.recordFailure(clientIp);
      expect(limiter.check(clientIp).remainingAttempts).toBe(3);

      limiter.recordSuccess(clientIp);
      expect(limiter.check(clientIp).remainingAttempts).toBe(5);
    });
  });

  describe('Desafío Secundario OTP (Zero-Knowledge y Anti-Enumeración)', () => {
    it('debe generar códigos OTP numéricos de 6 dígitos mediante CSPRNG', () => {
      const { otp, expiresAt } = magicLinkService.generateOtp('user@test.mx');

      expect(otp).toMatch(/^[0-9]{6}$/);
      expect(expiresAt).toBeGreaterThan(Date.now());
    });

    it('debe validar exitosamente con el código correcto y quemarlo (Single-Use Burn)', () => {
      const { otp } = magicLinkService.generateOtp('user2@test.mx');

      // Primer intento con código correcto
      const firstAttempt = magicLinkService.verifyOtp('user2@test.mx', otp);
      expect(firstAttempt.valid).toBe(true);

      // Segundo intento de reuso (Replay Attack): Debe ser rechazado
      const replayAttempt = magicLinkService.verifyOtp('user2@test.mx', otp);
      expect(replayAttempt.valid).toBe(false);
      expect(replayAttempt.reason).toContain('No existe ningún código OTP activo');
    });

    it('debe autodestruir el OTP y bloquear al usuario tras 5 intentos erróneos', () => {
      const { otp } = magicLinkService.generateOtp('victim@test.mx');

      // 4 intentos con código falso
      for (let i = 1; i <= 4; i++) {
        const attempt = magicLinkService.verifyOtp('victim@test.mx', '000000');
        expect(attempt.valid).toBe(false);
        expect(attempt.reason).toContain(`Te restan ${5 - i} intento(s)`);
      }

      // 5to intento con código falso: Destrucción del código
      const fifth = magicLinkService.verifyOtp('victim@test.mx', '000000');
      expect(fifth.valid).toBe(false);
      expect(fifth.reason).toContain('el código ha sido destruido por seguridad');

      // Incluso si ahora introduce el código original correcto, debe fallar
      const afterDestroy = magicLinkService.verifyOtp('victim@test.mx', otp);
      expect(afterDestroy.valid).toBe(false);
    });
  });
});
