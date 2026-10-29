import { z } from 'zod';
import { PartySchema } from './party.js';
import { ScopeSchema } from './scope.js';
import { PaymentPlanSchema } from './milestone.js';
import { IntellectualPropertySchema } from './intellectual-property.js';
import { GovernanceSchema } from './governance.js';
import { AuditTrailSchema } from './audit.js';
import { SignatureRecordSchema, Nom151StampSchema } from './signature.js';
import { AdjustmentSuggestionSchema } from './adjustment.js';

/**
 * Máquina de estados formal de un contrato en Pactio.
 */
export const ContractStatusSchema = z.enum([
  'DRAFT',                      // Edición activa del creador
  'PENDING_CLIENT_REVIEW',     // Enviado a revisión del cliente mediante Magic Link
  'ADJUSTMENT_REQUESTED',      // Cliente solicitó modificaciones paramétricas
  'COUNTER_PROPOSED',          // Creador envió contrapropuesta
  'PENDING_SIGNATURE',         // Aprobado bilateralmente; documento congelado
  'SIGNED_CREATOR',            // Firmado por el creador
  'SIGNED_CLIENT',             // Firmado por el cliente
  'SIGNED_BOTH_PENDING_PSC',   // Firmas completas; encolado hacia el PSC
  'COMPLETED_NOM151',          // Sellado final con constancia NOM-151 (Inmutable)
  'CANCELLED',                 // Rescindido o cancelado antes de firma
  'EXPIRED'                    // Caducado por inactividad o vencimiento de oferta
]);

/**
 * Esquema de Partes Bilaterales.
 */
export const ContractPartiesSchema = z.object({
  creator: PartySchema.refine(p => p.role === 'creator', {
    message: 'La parte prestadora debe tener el rol de creador.'
  }),
  client: PartySchema.refine(p => p.role === 'client', {
    message: 'La parte receptora debe tener el rol de cliente.'
  })
});

/**
 * Esquema de Firmas Bilaterales.
 */
export const ContractSignaturesSchema = z.object({
  creator: SignatureRecordSchema.optional(),
  client: SignatureRecordSchema.optional()
});

/**
 * ESQUEMA MAESTRO DEL CONTRATO EN PACTIO (ContractSchema).
 * Núcleo de Single Source of Truth para validación estricta y reactividad.
 */
export const ContractSchema = z.object({
  id: z.string().uuid({ message: 'El ID interno debe ser un UUID v4 o v7 válido' }),
  contractCode: z.string().regex(/^PACT-[0-9A-HJKMNP-TV-Z]{5,8}$/, {
    message: 'El código de contrato debe ser formato PACT-XXXXX en Crockford Base32'
  }),
  status: ContractStatusSchema.default('DRAFT'),
  versionMajor: z.number().int().min(1).default(1),
  versionMinor: z.number().int().min(0).default(0),

  // Los 5 módulos esenciales
  parties: ContractPartiesSchema,
  scope: ScopeSchema,
  payments: PaymentPlanSchema,
  intellectualProperty: IntellectualPropertySchema,
  governance: GovernanceSchema,

  // Negociación y Redlining Modular
  adjustments: z.array(AdjustmentSuggestionSchema).default([]),

  // Evidencia Jurídica y Criptografía
  signatures: ContractSignaturesSchema.default({}),
  nom151Stamp: Nom151StampSchema.optional(),
  
  // Representaciones Canónicas Duales
  canonicalMarkdown: z.string().default(''),
  canonicalPlainText: z.string().default(''),
  documentHash: z.string().length(64).default('0'.repeat(64)),

  // Cadena de Auditoría Inmutable (Hash Chained)
  auditTrail: AuditTrailSchema.default([]),

  // Metadatos de Vigencia y Preservación
  validUntil: z.string().datetime().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  deletedAt: z.string().datetime().nullable().default(null) // Soft-delete
});

/**
 * Esquema para la creación inicial de un contrato desde el Studio (Frontend Input).
 */
export const CreateContractInputSchema = z.object({
  parties: ContractPartiesSchema,
  scope: ScopeSchema,
  payments: PaymentPlanSchema,
  intellectualProperty: IntellectualPropertySchema.default({}),
  governance: GovernanceSchema.default({})
});

export type ContractStatus = z.infer<typeof ContractStatusSchema>;
export type ContractParties = z.infer<typeof ContractPartiesSchema>;
export type ContractSignatures = z.infer<typeof ContractSignaturesSchema>;
export type ContractData = z.infer<typeof ContractSchema>;
export type CreateContractInput = z.infer<typeof CreateContractInputSchema>;
