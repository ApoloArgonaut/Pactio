import { z } from 'zod';

/**
 * Punto individual de trazo táctil con vector temporal y presión barométrica/capacitiva.
 */
export const StrokePointSchema = z.object({
  x: z.number().min(0).max(1),       // Coordenada normalizada (0.0 a 1.0)
  y: z.number().min(0).max(1),       // Coordenada normalizada (0.0 a 1.0)
  time: z.number().int().nonnegative(), // Milisegundos transcurridos desde inicio del trazo
  pressure: z.number().min(0).max(1)  // Presión para stylus / Apple Pencil
});

/**
 * Trazo continuo compuesto por una secuencia de puntos muestreados.
 */
export const StrokeSchema = z.array(StrokePointSchema);

/**
 * Firma autógrafa digital basada en vectores paramétricos y SVG (Firma Electrónica Simple).
 */
export const BiometricSignatureSchema = z.object({
  type: z.literal('biometric_vector'),
  signerRole: z.enum(['creator', 'client']),
  signerName: z.string().min(2),
  signerEmail: z.string().email(),
  strokes: z.array(StrokeSchema).min(1, 'La firma debe contener al menos un trazo'),
  svgPathData: z.string().min(1, 'Ruta vectorial SVG para renderizado nítido en PDF'),
  signedAt: z.string().datetime(),
  ipAddress: z.string(),
  userAgent: z.string()
});

/**
 * Firma Electrónica Avanzada del SAT (e.firma - CFF Art. 17-D).
 * Criptografía asimétrica de Cero-Conocimiento (firmada 100% en el navegador).
 */
export const EfirmaSATSignatureSchema = z.object({
  type: z.literal('efirma_sat'),
  signerRole: z.enum(['creator', 'client']),
  signerName: z.string().min(2),
  signerEmail: z.string().email().optional(),
  signerRfc: z.string().length(12).or(z.string().length(13)),
  certificateSerialNumber: z.string().min(10),
  x509CertificatePem: z.string().min(50),
  signaturePkcs7DerBase64: z.string().min(50),
  signedAt: z.string().datetime(),
  ipAddress: z.string(),
  userAgent: z.string()
});

/**
 * Registro de Constancia de Conservación de Mensajes de Datos (NOM-151-SCFI-2016).
 */
export const Nom151StampSchema = z.object({
  constanciaId: z.string().min(5),
  documentHash: z.string().length(64),
  cenamTimestamp: z.string().datetime(),
  tsaIdentifier: z.string(),
  asn1DerBase64: z.string().min(50),
  qrVerificationUrl: z.string().url(),
  stampedAt: z.string().datetime()
});

export const SignatureRecordSchema = z.discriminatedUnion('type', [
  BiometricSignatureSchema,
  EfirmaSATSignatureSchema
]);

export type StrokePoint = z.infer<typeof StrokePointSchema>;
export type Stroke = z.infer<typeof StrokeSchema>;
export type BiometricSignature = z.infer<typeof BiometricSignatureSchema>;
export type EfirmaSATSignature = z.infer<typeof EfirmaSATSignatureSchema>;
export type SignatureRecord = z.infer<typeof SignatureRecordSchema>;
export type Nom151Stamp = z.infer<typeof Nom151StampSchema>;
