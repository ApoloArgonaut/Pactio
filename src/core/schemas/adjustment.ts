import { z } from 'zod';

/**
 * Campos con gobernanza editable para contrapropuestas y redlining modular.
 */
export const ALLOWED_ADJUSTMENT_FIELDS = [
  'milestones.dueDate',
  'milestones.deliverables',
  'scope.projectTitle',
  'scope.description',
  'scope.requiredClientInputs',
  'governance.includedRevisionRounds',
  'governance.tacitApprovalWindowDays',
  'payments.latePaymentInterestRateMonthly'
] as const;

/**
 * Campos estrictamente INMUTABLES por seguridad jurídica y prevención de cláusulas abusivas.
 */
export const FORBIDDEN_ADJUSTMENT_FIELDS = [
  'parties.creator.rfc',
  'parties.client.rfc',
  'intellectualProperty.transferTiming', // La cesión patrimonial SIEMPRE requiere liquidación íntegra
  'intellectualProperty.moralRightsRetention',
  'governance.liabilityCap'
] as const;

/**
 * Esquema individual de sugerencia de ajuste modular (Redlining Asíncrono).
 */
export const AdjustmentSuggestionSchema = z.object({
  id: z.string().min(1),
  clauseId: z.string().min(1),
  field: z.string().min(1),
  originalValue: z.unknown(),
  suggestedValue: z.unknown(),
  reason: z.string().min(5, 'Explique la razón del ajuste sugerido (mínimo 5 caracteres)').max(300),
  status: z.enum(['pending', 'accepted', 'rejected', 'counter_proposed']).default('pending'),
  counterProposalValue: z.unknown().optional(),
  suggestedBy: z.enum(['creator', 'client']).default('client'),
  createdAt: z.string().datetime(),
  resolvedAt: z.string().datetime().optional()
});

/**
 * Validador de política de gobernanza: verifica si un campo tiene permitido el ajuste modular.
 */
export function isFieldAdjustmentAllowed(fieldPath: string): { allowed: boolean; reason?: string } {
  // Comprobar si está en lista negra
  if (FORBIDDEN_ADJUSTMENT_FIELDS.some(forbidden => fieldPath.startsWith(forbidden))) {
    return {
      allowed: false,
      reason: `El campo '${fieldPath}' es inmutable por principios de seguridad jurídica de Pactio.`
    };
  }

  return { allowed: true };
}

export type AdjustmentSuggestion = z.infer<typeof AdjustmentSuggestionSchema>;
