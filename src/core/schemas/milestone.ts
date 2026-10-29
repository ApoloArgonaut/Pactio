import { z } from 'zod';

/**
 * Estados del ciclo de vida de un hito de entrega y cobro.
 */
export const MilestoneStatusSchema = z.enum([
  'pending',
  'in_progress',
  'delivered',
  'adjustment_requested',
  'approved',
  'paid'
]);

/**
 * Esquema individual de un Hito Contractual (Milestone).
 * NOTA CRÍTICA DE INGENIERÍA: Todos los importes se expresan en centavos enteros (integer cents)
 * para evitar discrepancias por errores de redondeo de punto flotante (IEEE 754).
 */
export const MilestoneSchema = z.object({
  id: z.string().min(1, 'El identificador de hito es obligatorio'),
  order: z.number().int().positive('El orden debe ser un entero positivo (1-based)'),
  title: z.string().min(2, 'El título del hito es obligatorio').max(120),
  description: z.string().max(500).optional(),
  deliverables: z.array(z.string().min(1)).min(1, 'Debe incluir al menos un entregable tangible'),
  percentage: z.number().min(1, 'El porcentaje mínimo es 1%').max(100, 'El porcentaje máximo es 100%'),
  amountCents: z.number().int().nonnegative('El importe debe ser un entero no negativo en centavos'),
  dueDate: z.string().optional(), // Fecha límite sugerida en ISO 8601 o días relativos
  daysAfterTrigger: z.number().int().nonnegative().optional(), // ej. 15 días tras entrega de insumos
  status: MilestoneStatusSchema.default('pending')
});

/**
 * Esquema exhaustivo del Plan de Pagos e Invariantes Financieras.
 */
export const PaymentPlanSchema = z.object({
  currency: z.enum(['MXN', 'USD', 'EUR']).default('MXN'),
  totalAmountCents: z.number().int().positive('El monto total debe ser mayor a cero centavos'),
  model: z.enum(['milestones', 'fixed_50_50', 'full_advance', 'custom']).default('milestones'),
  milestones: z.array(MilestoneSchema).min(1, 'Debe especificarse al menos un hito de pago'),
  
  // Parámetros de protección financiera preventiva
  latePaymentInterestRateMonthly: z.number().min(0).max(10).default(3.0), // Tasa moratoria mensual (3% default)
  gracePeriodDays: z.number().int().min(0).max(30).default(5), // Días de gracia antes de mora
  suspensionThresholdDays: z.number().int().min(1).max(30).default(5), // Días de impago antes de suspender actividades
  paymentMethodDetails: z.string().max(200).optional()
}).refine((data) => {
  // Invariante 1: La suma de porcentajes de los hitos debe sumar exactamente 100%
  const totalPercentage = data.milestones.reduce((acc, m) => acc + m.percentage, 0);
  // Tolerancia de precisión decimal por divisiones de 33.33...
  return Math.abs(totalPercentage - 100) < 0.01;
}, {
  message: 'La suma de porcentajes de todos los hitos debe ser exactamente igual al 100%.',
  path: ['milestones']
}).refine((data) => {
  // Invariante 2: La suma aritmética de centavos debe igualar al totalAmountCents
  const calculatedTotalCents = data.milestones.reduce((acc, m) => acc + m.amountCents, 0);
  // Permitimos discrepancia máxima de 1 centavo por redondeo unitario
  return Math.abs(calculatedTotalCents - data.totalAmountCents) <= data.milestones.length;
}, {
  message: 'La suma de montos en centavos de los hitos no coincide con el total contratado.',
  path: ['totalAmountCents']
});

export type Milestone = z.infer<typeof MilestoneSchema>;
export type PaymentPlan = z.infer<typeof PaymentPlanSchema>;
export type MilestoneStatus = z.infer<typeof MilestoneStatusSchema>;
