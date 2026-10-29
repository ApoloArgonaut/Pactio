import { randomUUID } from 'crypto';
import { contractRepository } from '../../../../../../core/db/contract-repository.js';
import { isDocumentFrozen, assertCanTransition } from '../../../../../../core/fsm/contract-fsm.js';
import { isFieldAdjustmentAllowed, AdjustmentSuggestionSchema } from '../../../../../../core/schemas/adjustment.js';
import { computeEventHash, type AuditEvent } from '../../../../../../core/schemas/audit.js';
import {
  compileToCanonicalMarkdown,
  compileToCanonicalPlainText,
  generateDocumentHash
} from '../../../../../../core/compiler/dual-compiler.js';

interface RouteContext {
  params: {
    code: string;
  };
}

/**
 * POST /api/v1/contracts/[code]/adjust
 * Endpoint de negociación y redlining paramétrico estructurado.
 */
export async function POST(req: Request, context: RouteContext) {
  try {
    const { code } = context.params;
    const contract = await contractRepository.findByCode(code);

    if (!contract) {
      return new Response(JSON.stringify({
        type: 'https://pactio.lat/errors/not-found',
        title: 'Contrato No Encontrado',
        status: 404,
        detail: `No existe ningún contrato activo asociado al código ${code}.`
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/problem+json' }
      });
    }

    // 1. Verificación de inmutabilidad del estado
    if (isDocumentFrozen(contract.status)) {
      return new Response(JSON.stringify({
        type: 'https://pactio.lat/errors/contract-frozen',
        title: 'Contrato Congelado para Modificaciones',
        status: 409,
        detail: `El contrato se encuentra en estado '${contract.status}', por lo que su contenido legal es inmutable.`
      }), {
        status: 409,
        headers: { 'Content-Type': 'application/problem+json' }
      });
    }

    const body = await req.json();

    // 2. Validación de gobernanza paramétrica (Lista negra de campos)
    const governanceCheck = isFieldAdjustmentAllowed(body.field);
    if (!governanceCheck.allowed) {
      return new Response(JSON.stringify({
        type: 'https://pactio.lat/errors/governance-violation',
        title: 'Campo Inmutable por Reglas de Gobernanza',
        status: 403,
        detail: governanceCheck.reason
      }), {
        status: 403,
        headers: { 'Content-Type': 'application/problem+json' }
      });
    }

    // 3. Crear registro de ajuste
    const nowIso = new Date().toISOString();
    const adjustmentId = `adj_${randomUUID()}`;

    const newAdjustment = {
      id: adjustmentId,
      clauseId: body.clauseId || body.field,
      field: body.field,
      originalValue: body.originalValue,
      suggestedValue: body.suggestedValue,
      reason: body.reason,
      status: 'pending' as const,
      suggestedBy: (body.suggestedBy || 'client') as 'creator' | 'client',
      createdAt: nowIso
    };

    const parsedAdjustment = AdjustmentSuggestionSchema.parse(newAdjustment);

    // 4. Determinar transición de estado
    const nextStatus = newAdjustment.suggestedBy === 'client' 
      ? 'ADJUSTMENT_REQUESTED' 
      : 'COUNTER_PROPOSED';

    if (contract.status !== nextStatus) {
      assertCanTransition(contract.status, nextStatus);
      contract.status = nextStatus;
    }

    // 5. Incrementar versión menor (v1.0 -> v1.1)
    contract.versionMinor += 1;
    contract.adjustments.push(parsedAdjustment);
    contract.updatedAt = nowIso;

    // 6. Recalcular compilación canónica y hash
    contract.canonicalMarkdown = compileToCanonicalMarkdown(contract);
    contract.canonicalPlainText = compileToCanonicalPlainText(contract);
    contract.documentHash = generateDocumentHash(contract.canonicalPlainText);

    // 7. Generar eslabón en el Audit Trail
    const lastEvent = contract.auditTrail[contract.auditTrail.length - 1];
    const prevHash = lastEvent ? lastEvent.currentEventHash : 'GENESIS_BLOCK';
    const auditEventId = `evt_${randomUUID()}`;
    const actorEmail = newAdjustment.suggestedBy === 'client' ? contract.parties.client.email : contract.parties.creator.email;

    const currentHash = computeEventHash({
      eventId: auditEventId,
      sequenceIndex: contract.auditTrail.length,
      timestamp: nowIso,
      action: 'ADJUSTMENT_SUGGESTED',
      actorEmail,
      documentHashAtEvent: contract.documentHash,
      previousEventHash: prevHash
    });

    const auditEvent: AuditEvent = {
      eventId: auditEventId,
      contractId: contract.id,
      contractCode: contract.contractCode,
      version: `${contract.versionMajor}.${contract.versionMinor}`,
      sequenceIndex: contract.auditTrail.length,
      action: 'ADJUSTMENT_SUGGESTED',
      actor: {
        role: newAdjustment.suggestedBy,
        email: actorEmail
      },
      metadata: {
        ipAddress: req.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1',
        userAgent: req.headers.get('user-agent') || 'Pactio-Client-Portal',
        timestamp: nowIso
      },
      documentHashAtEvent: contract.documentHash,
      previousEventHash: prevHash,
      currentEventHash: currentHash
    };

    contract.auditTrail.push(auditEvent);
    await contractRepository.save(contract);

    return new Response(JSON.stringify({
      success: true,
      adjustment: parsedAdjustment,
      contractStatus: contract.status,
      version: `v${contract.versionMajor}.${contract.versionMinor}`
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    return new Response(JSON.stringify({
      type: 'https://pactio.lat/errors/adjustment-error',
      title: 'Error Procesando Ajuste Modular',
      status: 400,
      detail: error.message
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/problem+json' }
    });
  }
}
