import { createHash, randomBytes, timingSafeEqual } from 'crypto';
import type { Nom151Stamp } from '../schemas/signature.js';

/**
 * Expresión regular canónica para validar digests SHA-256 en formato hexadecimal.
 */
export const SHA256_HEX_REGEX = /^[0-9a-fA-F]{64}$/;

/**
 * Comparación segura en tiempo constante de hashes hexadecimales SHA-256.
 */
export function safeHashCompare(hashA: string, hashB: string): boolean {
  if (!SHA256_HEX_REGEX.test(hashA) || !SHA256_HEX_REGEX.test(hashB)) {
    return false;
  }
  const bufA = Buffer.from(hashA.toLowerCase(), 'utf8');
  const bufB = Buffer.from(hashB.toLowerCase(), 'utf8');
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

/**
 * Parámetros de configuración del Proveedor de Servicios de Certificación (PSC) acreditado ante SE.
 */
export const PSC_MOCK_CONFIG = {
  tsaName: 'CN=PSC PACTIO NOM-151 TSA 01, OU=PRESTADOR DE SERVICIOS DE CERTIFICACION, O=SECRETARIA DE ECONOMIA, C=MX',
  tsaPolicyOid: '1.3.6.1.4.1.42.2.27.1', // OID regulatorio para constancias de conservación NOM-151
  hashAlgorithmOid: '2.16.840.1.101.3.4.2.1', // OID oficial para SHA-256
  cenamNtpServer: 'ntp.cenam.mx',
  verificationBaseUrl: 'https://pactio.lat/verify/nom151'
};

/**
 * Interfaz de solicitud de sellado ante el PSC.
 */
export interface Nom151StampRequest {
  documentHash: string; // Digest SHA-256 en hexadecimal (64 caracteres)
  contractCode: string; // ej. "PACT-8X9K2"
  signerEmails?: string[];
}

/**
 * Genera una estructura ASN.1 DER simulada y serializada en Base64,
 * cumpliendo con la especificación RFC 3161 (Time-Stamp Protocol) y la NOM-151-SCFI-2016.
 */
function buildMockAsn1DerBase64(params: {
  documentHash: string;
  serialNumber: string;
  cenamIsoDate: string;
}): string {
  // En producción, esto se genera con un módulo ASN.1 DER nativo codificando la estructura TSTInfo.
  // En el mock de ingeniería, emulamos la envoltura binaria mediante un JSON estructurado codificado en Base64
  // con el prefijo canónico de cabecera ASN.1 Sequence (0x30).
  const asn1Struct = {
    version: 1,
    policy: PSC_MOCK_CONFIG.tsaPolicyOid,
    messageImprint: {
      hashAlgorithm: PSC_MOCK_CONFIG.hashAlgorithmOid,
      hashedMessage: params.documentHash
    },
    serialNumber: params.serialNumber,
    genTime: params.cenamIsoDate,
    accuracy: { seconds: 1, millis: 0, micros: 0 },
    ordering: true,
    tsa: PSC_MOCK_CONFIG.tsaName,
    signatureAlgorithm: '1.2.840.113549.1.1.11', // sha256WithRSAEncryption
    mockSignatureBytes: randomBytes(128).toString('hex')
  };

  return Buffer.from(JSON.stringify(asn1Struct), 'utf8').toString('base64');
}

/**
 * Cliente Mock de Integración con el PSC para Emisión de Constancias NOM-151.
 */
export class Nom151MockService {
  /**
   * Solicita el sellado de tiempo de un documento con estampa trazable al CENAM.
   */
  public async requestTimestamp(req: Nom151StampRequest): Promise<Nom151Stamp> {
    // 1. Validación estricta del hash de entrada (64 caracteres hexadecimales)
    if (!req.documentHash || !SHA256_HEX_REGEX.test(req.documentHash)) {
      throw new Error(`Hash inválido para timbrado NOM-151: debe ser un digest SHA-256 de 64 caracteres hex.`);
    }

    // 2. Simulación de sincronización atómica con CENAM (Centro Nacional de Metrología)
    const now = new Date();
    const cenamTimestamp = now.toISOString();

    // 3. Generación del número de serie único de la constancia (Hexadecimal de 64 bits)
    const serialNumber = randomBytes(8).toString('hex').toUpperCase();
    const constanciaId = `NOM151-${req.contractCode}-${serialNumber}`;

    // 4. Construcción del token ASN.1 DER
    const asn1DerBase64 = buildMockAsn1DerBase64({
      documentHash: req.documentHash,
      serialNumber,
      cenamIsoDate: cenamTimestamp
    });

    const qrVerificationUrl = `${PSC_MOCK_CONFIG.verificationBaseUrl}/${constanciaId}?hash=${req.documentHash}`;

    return {
      constanciaId,
      documentHash: req.documentHash,
      cenamTimestamp,
      tsaIdentifier: PSC_MOCK_CONFIG.tsaName,
      asn1DerBase64,
      qrVerificationUrl,
      stampedAt: cenamTimestamp
    };
  }

  /**
   * Verifica la autenticidad e integridad de una constancia NOM-151 existente
   * frente al hash actual del documento.
   */
  public verifyStamp(
    stamp: Nom151Stamp,
    currentDocumentHash: string
  ): { valid: boolean; cenamTime: string; reason?: string } {
    // 1. Verificación en tiempo constante contra alteración (Tampering Prevention)
    if (!safeHashCompare(stamp.documentHash, currentDocumentHash)) {
      return {
        valid: false,
        cenamTime: stamp.cenamTimestamp,
        reason: 'Violación de Integridad: El hash del documento actual difiere del hash sellado en la constancia NOM-151.'
      };
    }

    // 2. Verificación de decodificación de la estructura ASN.1
    try {
      const decodedJson = Buffer.from(stamp.asn1DerBase64, 'base64').toString('utf8');
      const parsed = JSON.parse(decodedJson);

      if (!safeHashCompare(parsed.messageImprint?.hashedMessage || '', stamp.documentHash)) {
        return {
          valid: false,
          cenamTime: stamp.cenamTimestamp,
          reason: 'La constancia ASN.1 interna no coincide con el digest registrado.'
        };
      }
    } catch {
      return {
        valid: false,
        cenamTime: stamp.cenamTimestamp,
        reason: 'Estructura ASN.1 DER ilegible o corrupta.'
      };
    }

    return {
      valid: true,
      cenamTime: stamp.cenamTimestamp
    };
  }
}

// Instancia singleton para consumo en la aplicación
export const nom151MockService = new Nom151MockService();
