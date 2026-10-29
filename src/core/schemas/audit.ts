import { z } from 'zod';
import { createHash } from 'crypto';
import { constantTimeCompare } from '../crypto/nanoid.js';

/**
 * Catálogo canónico de acciones registradas en el Audit Trail inmutable.
 */
export const AuditActionSchema = z.enum([
  'CONTRACT_CREATED',
  'SENT_TO_REVIEW',
  'MAGIC_LINK_CLAIMED',
  'ADJUSTMENT_SUGGESTED',
  'ADJUSTMENT_ACCEPTED',
  'ADJUSTMENT_REJECTED',
  'COUNTER_PROPOSAL_SENT',
  'CONTRACT_APPROVED',
  'SIGNATURE_SUBMITTED_CREATOR',
  'SIGNATURE_SUBMITTED_CLIENT',
  'PSC_TIMESTAMP_ATTACHED',
  'CONTRACT_COMPLETED',
  'CONTRACT_CANCELLED'
]);

/**
 * Metadatos forenses recopilados para no repudio probatorio.
 */
export const AuditMetadataSchema = z.object({
  ipAddress: z.string().ip({ message: 'Dirección IP forense inválida' }).or(z.literal('127.0.0.1')).or(z.literal('::1')),
  userAgent: z.string().min(1, 'El encabezado User-Agent es requerido'),
  screenResolution: z.string().optional(),
  tlsFingerprint: z.string().optional(),
  timestamp: z.string().datetime({ message: 'Timestamp debe cumplir con ISO 8601' })
});

/**
 * Actor responsable de la acción.
 */
export const AuditActorSchema = z.object({
  role: z.enum(['creator', 'client', 'system']),
  email: z.string().email(),
  identifier: z.string().optional()
});

/**
 * Esquema individual de Evento de Auditoría con Encadenamiento Criptográfico (Hash Chaining).
 */
export const AuditEventSchema = z.object({
  eventId: z.string().min(1),
  contractId: z.string().min(1),
  contractCode: z.string().regex(/^PACT-[0-9A-HJKMNP-TV-Z]{5,8}$/),
  version: z.string().regex(/^v?[0-9]+\.[0-9]+$/), // ej. "1.0", "1.1"
  sequenceIndex: z.number().int().nonnegative(),
  action: AuditActionSchema,
  actor: AuditActorSchema,
  metadata: AuditMetadataSchema,
  documentHashAtEvent: z.string().length(64, 'El hash del documento debe ser SHA-256 en formato hex (64 caracteres)'),
  previousEventHash: z.string().min(1),
  currentEventHash: z.string().length(64, 'El hash del evento debe ser SHA-256 de 64 caracteres')
});

export const AuditTrailSchema = z.array(AuditEventSchema);

export type AuditAction = z.infer<typeof AuditActionSchema>;
export type AuditMetadata = z.infer<typeof AuditMetadataSchema>;
export type AuditActor = z.infer<typeof AuditActorSchema>;
export type AuditEvent = z.infer<typeof AuditEventSchema>;
export type AuditTrail = z.infer<typeof AuditTrailSchema>;

/**
 * Genera el digest SHA-256 de un evento para garantizar encadenamiento inmutable (Merkle Hash Chain).
 */
export function computeEventHash(params: {
  eventId: string;
  sequenceIndex: number;
  timestamp: string;
  action: string;
  actorEmail: string;
  documentHashAtEvent: string;
  previousEventHash: string;
}): string {
  const payload = [
    params.eventId,
    params.sequenceIndex.toString(),
    params.timestamp,
    params.action,
    params.actorEmail,
    params.documentHashAtEvent,
    params.previousEventHash
  ].join('|');

  return createHash('sha256').update(payload, 'utf8').digest('hex');
}

/**
 * Valida la integridad criptográfica de toda la cadena de auditoría histórica.
 * Retorna true si todos los eslabones coinciden exactamente; false ante cualquier alteración de bytes.
 */
export function verifyAuditChainIntegrity(trail: AuditEvent[]): { valid: boolean; brokenIndex?: number } {
  if (trail.length === 0) return { valid: true };

  for (let i = 0; i < trail.length; i++) {
    const current = trail[i];

    // Verificar eslabón con el evento anterior
    if (i === 0) {
      if (current.previousEventHash !== 'GENESIS_BLOCK') {
        return { valid: false, brokenIndex: 0 };
      }
    } else {
      const prev = trail[i - 1];
      if (current.previousEventHash !== prev.currentEventHash) {
        return { valid: false, brokenIndex: i };
      }
    }

    // Recalcular hash del nodo actual
    const expectedHash = computeEventHash({
      eventId: current.eventId,
      sequenceIndex: current.sequenceIndex,
      timestamp: current.metadata.timestamp,
      action: current.action,
      actorEmail: current.actor.email,
      documentHashAtEvent: current.documentHashAtEvent,
      previousEventHash: current.previousEventHash
    });

    if (!constantTimeCompare(current.currentEventHash, expectedHash)) {
      return { valid: false, brokenIndex: i };
    }
  }

  return { valid: true };
}
