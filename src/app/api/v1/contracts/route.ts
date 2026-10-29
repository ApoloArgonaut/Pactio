import { randomUUID } from 'crypto';
import { CreateContractInputSchema, ContractSchema, type ContractData } from '../../../../core/schemas/contract.js';
import { generateContractCode } from '../../../../core/crypto/nanoid.js';
import {
  compileToCanonicalMarkdown,
  compileToCanonicalPlainText,
  generateDocumentHash
} from '../../../../core/compiler/dual-compiler.js';
import { computeEventHash, type AuditEvent } from '../../../../core/schemas/audit.js';
import { contractRepository } from '../../../../core/db/contract-repository.js';

/**
 * POST /api/v1/contracts
 * Crea un nuevo contrato en estado DRAFT, calculando su código Crockford Base32,
 * precompilando sus representaciones canónicas y generando el bloque génesis de auditoría.
 */
export async function POST(req: Request) {
  try {
    const rawBody = await req.json();

    // 1. Validación estricta con Zod
    const validationResult = CreateContractInputSchema.safeParse(rawBody);
    if (!validationResult.success) {
      return new Response(JSON.stringify({
        type: 'https://pactio.lat/errors/validation-error',
        title: 'Error de Validación en los Datos del Contrato',
        status: 422,
        errors: validationResult.error.flatten()
      }), {
        status: 422,
        headers: { 'Content-Type': 'application/problem+json' }
      });
    }

    const input = validationResult.data;
    const nowIso = new Date().toISOString();
    const contractId = randomUUID();
    const contractCode = generateContractCode(5);

    // 2. Pre-construcción del objeto canónico
    const candidateContract: ContractData = {
      id: contractId,
      contractCode,
      status: 'DRAFT',
      versionMajor: 1,
      versionMinor: 0,
      parties: input.parties,
      scope: input.scope,
      payments: input.payments,
      intellectualProperty: input.intellectualProperty,
      governance: input.governance,
      adjustments: [],
      signatures: {},
      canonicalMarkdown: '',
      canonicalPlainText: '',
      documentHash: '0'.repeat(64),
      auditTrail: [],
      createdAt: nowIso,
      updatedAt: nowIso,
      deletedAt: null
    };

    // 3. Compilación canónica dual determinista
    const canonicalMarkdown = compileToCanonicalMarkdown(candidateContract);
    const canonicalPlainText = compileToCanonicalPlainText(candidateContract);
    const documentHash = generateDocumentHash(canonicalPlainText);

    candidateContract.canonicalMarkdown = canonicalMarkdown;
    candidateContract.canonicalPlainText = canonicalPlainText;
    candidateContract.documentHash = documentHash;

    // 4. Generación del bloque génesis del Audit Trail
    const genesisEventId = `evt_${randomUUID()}`;
    const genesisEventHash = computeEventHash({
      eventId: genesisEventId,
      sequenceIndex: 0,
      timestamp: nowIso,
      action: 'CONTRACT_CREATED',
      actorEmail: input.parties.creator.email,
      documentHashAtEvent: documentHash,
      previousEventHash: 'GENESIS_BLOCK'
    });

    const genesisEvent: AuditEvent = {
      eventId: genesisEventId,
      contractId,
      contractCode,
      version: '1.0',
      sequenceIndex: 0,
      action: 'CONTRACT_CREATED',
      actor: {
        role: 'creator',
        email: input.parties.creator.email,
        identifier: input.parties.creator.rfc
      },
      metadata: {
        ipAddress: req.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1',
        userAgent: req.headers.get('user-agent') || 'Pactio-API-Client',
        timestamp: nowIso
      },
      documentHashAtEvent: documentHash,
      previousEventHash: 'GENESIS_BLOCK',
      currentEventHash: genesisEventHash
    };

    candidateContract.auditTrail.push(genesisEvent);

    // 5. Persistencia
    await contractRepository.save(candidateContract);

    return new Response(JSON.stringify({
      success: true,
      data: candidateContract
    }), {
      status: 201,
      headers: {
        'Content-Type': 'application/json',
        'Location': `/api/v1/contracts/${contractCode}`
      }
    });

  } catch (error: any) {
    return new Response(JSON.stringify({
      type: 'https://pactio.lat/errors/internal-error',
      title: 'Error Interno del Servidor',
      status: 500,
      detail: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/problem+json' }
    });
  }
}
