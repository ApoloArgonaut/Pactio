import { z } from 'zod';

/**
 * Esquema de Gobernanza, Revisiones, Silencio Tácito y Salida Limpia (Módulo 5).
 */
export const GovernanceSchema = z.object({
  // Rondas de revisión técnica y de diseño incluidas
  includedRevisionRounds: z.number().int().min(1).max(5).default(2),

  // Costo por ronda de ajuste adicional no presupuestada (en centavos)
  additionalRevisionFeeCents: z.number().int().nonnegative().default(150000), // $1,500.00 MXN

  // Ventana de silencio para aceptación ficta/tácita (días hábiles)
  tacitApprovalWindowDays: z.number().int().min(1).max(15).default(5),

  // Cláusula de Salida Amistosa (Kill Fee): Porcentaje de retención o compensación por cancelación intempestiva
  killFeePercentage: z.number().min(0).max(100).default(50), // Retiene anticipo y cobra prorrata

  // Límite de Responsabilidad Civil (Liability Cap)
  liabilityCap: z.enum([
    'total_contract_value',
    'fees_paid_to_date'
  ]).default('fees_paid_to_date'),

  // Jurisdicción y tribunales competentes
  jurisdiction: z.object({
    city: z.string().min(2).default('Ciudad de México'),
    state: z.string().min(2).default('CDMX'),
    country: z.string().default('México')
  }).default({
    city: 'Ciudad de México',
    state: 'CDMX',
    country: 'México'
  }),

  // Método de resolución pacífica de controversias
  disputeResolutionMethod: z.enum([
    'amicable_negotiation',
    'profeco_arbitration',
    'mercantile_courts'
  ]).default('amicable_negotiation')
});

export type Governance = z.infer<typeof GovernanceSchema>;
