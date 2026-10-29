import { z } from 'zod';

/**
 * Esquema de Alcance, Entregables e Insumos (Módulo 2: Anti-Scope Creep).
 */
export const ScopeSchema = z.object({
  projectTitle: z.string().min(3, 'El título del proyecto es obligatorio').max(150),
  serviceCategory: z.enum([
    'ux_ui_design',
    'web_development',
    'branding_identity',
    'mobile_app',
    'consulting',
    'content_creation',
    'other'
  ]).default('ux_ui_design'),
  description: z.string().min(10, 'La descripción del servicio debe contener al menos 10 caracteres').max(3000),
  
  // Entregables tangibles
  deliverablesSummary: z.array(z.string().min(2)).min(1, 'Especifique al menos un entregable principal'),
  
  // Insumos requeridos del cliente (Condición suspensiva de cómputo de tiempos)
  requiredClientInputs: z.array(z.string().min(2)).default([
    'Logotipos y manual de identidad visual en formato vectorial',
    'Textos definitivos y copys revisados por el cliente',
    'Credenciales de acceso a entornos de desarrollo / servidores'
  ]),
  
  // Lista explícita de elementos "Fuera de Alcance" (Anti-Scope Creep)
  outOfScope: z.array(z.string().min(2)).default([
    'Compra de licencias tipográficas, plugins o stock fotográfico comercial',
    'Mantenimiento o soporte técnico posterior a la aceptación definitiva',
    'Desarrollo de integraciones no especificadas en la propuesta original'
  ]),
  
  // Condición determinante para inicio del cronograma
  startDateTrigger: z.enum([
    'upon_signature',
    'upon_advance_payment',
    'upon_inputs_received'
  ]).default('upon_inputs_received'),
  
  estimatedDurationDays: z.number().int().positive().optional()
});

export type Scope = z.infer<typeof ScopeSchema>;
