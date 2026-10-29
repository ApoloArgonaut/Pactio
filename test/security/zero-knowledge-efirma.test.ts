import { describe, it, expect } from 'vitest';
import {
  EfirmaSATSignatureSchema,
  BiometricSignatureSchema,
  SignatureRecordSchema
} from '../../src/core/schemas/signature.js';

describe('AppSec Audit: Arquitectura Cero-Conocimiento (e.firma SAT & Biometría)', () => {
  describe('Esquema de Firma SAT (e.firma - CFF Art. 17-D)', () => {
    it('debe validar exitosamente firmas que contienen únicamente artefactos públicos y verificables', () => {
      const validEfirmaPayload = {
        type: 'efirma_sat',
        signerRole: 'creator',
        signerName: 'Sofía Valenzuela Mendoza',
        signerRfc: 'VAMS9005128D3',
        certificateSerialNumber: '30001000000500003416',
        x509CertificatePem: '-----BEGIN CERTIFICATE-----\nMIIF...MOCK_PEM_BASE64_LONG_ENOUGH_FOR_VALIDATION_RULES\n-----END CERTIFICATE-----',
        signaturePkcs7DerBase64: 'MII...MOCK_PKCS7_DER_SIGNATURE_BYTES_LONG_ENOUGH_FOR_SCHEMA',
        signedAt: '2026-10-29T10:00:00.000Z',
        ipAddress: '189.200.10.5',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'
      };

      const result = EfirmaSATSignatureSchema.safeParse(validEfirmaPayload);
      expect(result.success).toBe(true);
    });

    it('debe certificar que el esquema Cero-Conocimiento descarta llaves privadas (.key) o contraseñas', () => {
      // El esquema de Pactio nunca debe declarar campos para la llave privada o clave CIEC
      const schemaShape = EfirmaSATSignatureSchema.shape;

      expect('privateKey' in schemaShape).toBe(false);
      expect('privateKeyPem' in schemaShape).toBe(false);
      expect('keyPassword' in schemaShape).toBe(false);
      expect('password' in schemaShape).toBe(false);
      expect('keyFileBase64' in schemaShape).toBe(false);

      // Si un atacante o cliente intenta enviar campos prohibidos con la llave privada:
      const payloadWithLeak = {
        type: 'efirma_sat',
        signerRole: 'creator',
        signerName: 'Sofía Valenzuela Mendoza',
        signerRfc: 'VAMS9005128D3',
        certificateSerialNumber: '30001000000500003416',
        x509CertificatePem: '-----BEGIN CERTIFICATE-----\nMIIF...MOCK_PEM_BASE64_LONG_ENOUGH_FOR_VALIDATION_RULES\n-----END CERTIFICATE-----',
        signaturePkcs7DerBase64: 'MII...MOCK_PKCS7_DER_SIGNATURE_BYTES_LONG_ENOUGH_FOR_SCHEMA',
        signedAt: '2026-10-29T10:00:00.000Z',
        ipAddress: '189.200.10.5',
        userAgent: 'Mozilla/5.0',
        // Inyección no autorizada de llave privada
        privateKey: 'SECRET_UNENCRYPTED_KEY_BYTES'
      };

      const parsed = EfirmaSATSignatureSchema.parse(payloadWithLeak);
      // Zod strip() remueve cualquier campo no definido en el esquema estricto
      expect('privateKey' in parsed).toBe(false);
    });
  });

  describe('Esquema de Firma Biométrica Dinámica (Código de Comercio Art. 89)', () => {
    it('debe registrar trazos dinámicos con coordenadas normalizadas (0 a 1) y vector de tiempo', () => {
      const validBiometric = {
        type: 'biometric_vector',
        signerRole: 'client',
        signerName: 'Mario Nova',
        signerEmail: 'mario@novatech.mx',
        strokes: [
          [
            { x: 0.12, y: 0.45, time: 0, pressure: 0.7 },
            { x: 0.15, y: 0.48, time: 45, pressure: 0.8 },
            { x: 0.22, y: 0.52, time: 110, pressure: 0.6 }
          ]
        ],
        svgPathData: 'M 12 45 Q 15 48 22 52',
        signedAt: '2026-10-29T10:15:00.000Z',
        ipAddress: '201.140.2.1',
        userAgent: 'Mobile Safari on iPad Pro'
      };

      const result = BiometricSignatureSchema.safeParse(validBiometric);
      expect(result.success).toBe(true);
    });

    it('debe rechazar coordenadas de trazo fuera del rango normalizado [0, 1]', () => {
      const invalidBiometric = {
        type: 'biometric_vector',
        signerRole: 'client',
        signerName: 'Mario Nova',
        signerEmail: 'mario@novatech.mx',
        strokes: [
          [
            { x: 1.5, y: -0.2, time: 10, pressure: 2.0 } // Fuera de rango
          ]
        ],
        svgPathData: 'M 15 -2',
        signedAt: '2026-10-29T10:15:00.000Z',
        ipAddress: '127.0.0.1',
        userAgent: 'Test'
      };

      const result = BiometricSignatureSchema.safeParse(invalidBiometric);
      expect(result.success).toBe(false);
    });
  });
});
