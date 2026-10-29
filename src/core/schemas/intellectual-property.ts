import { z } from 'zod';

/**
 * Esquema de Propiedad Intelectual y Confidencialidad (Módulo 4).
 * Fundamentado en la Ley Federal del Derecho de Autor (LFDA Art. 83) de México.
 */
export const IntellectualPropertySchema = z.object({
  // Regla de Oro con Candado: La cesión patrimonial se condiciona a la liquidación íntegra
  transferTiming: z.enum([
    'upon_final_payment', // Predeterminado e inmutable para salvaguardar al creador
    'upon_milestone_delivery'
  ]).default('upon_final_payment'),

  // Retención inalienable de derechos morales (reconocimiento de autoría)
  moralRightsRetention: z.boolean().default(true),

  // Autorización para portafolio público y casos de estudio
  creatorPortfolioRights: z.boolean().default(true),

  // Periodo de vigencia de las obligaciones de confidencialidad
  confidentialityDurationYears: z.number().int().min(1).max(10).default(3),

  // Alcance del secreto comercial y protección de know-how previo del creador
  retainCreatorBackgroundIP: z.boolean().default(true),

  // Cláusula de no exclusividad: El creador puede prestar servicios similares a terceros
  nonExclusiveServices: z.boolean().default(true)
});

export type IntellectualProperty = z.infer<typeof IntellectualPropertySchema>;
