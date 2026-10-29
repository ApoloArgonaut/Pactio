import { randomUUID } from 'crypto';
import { contractRepository } from '../../../../../../core/db/contract-repository.js';
import { SignatureRecordSchema } from '../../../../../../core/schemas/signature.js';
import { computeEventHash, type AuditEvent } from '../../../../../../core/schemas/audit.js';
import { nom151MockService, safeHashCompare } from '../../../../../../core/psc/nom151-mock.js';

interface RouteContext {
  params: {
    code: string;
  };
}

/**
 * POST /api/v1/contracts/[code]/sign
 * Procesa la recepción de firmas digitales (Biométrica vectorial o SAT e.firma),
 * valida la integridad del documento mediante SHA-256 y detona el timbrado NOM-151.
 */
export async function POST(req: Request, context: RouteContext) {
  try {
    const { code } = context.params;
    const contract = await contractRepository.findByCode(code);

    if (!contract) {
      return new Response(JSON.stringify({
        type: 'https://pactio.lat/errors/not-found',
        title: 'Contrato No Encontrado',
        status: 404
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/problem+json' }
      });
    }

    const body = await req.json();

    // 1. Verificación Criptográfica contra Alteración (Tampering Prevention en tiempo constante)
    if (body.documentHash && !safeHashCompare(body.documentHash, contract.documentHash)) {
      return new Response(JSON.stringify({
        type: 'https://pactio.lat/errors/tampering-detected',
        title: 'Violación de Integridad en Documento',
        status: 409,
        detail: 'El hash del documento firmado no coincide con el digest canónico registrado en el servidor. La firma fue rechazada.'
      }), {
        status: 409,
        headers: { 'Content-Type': 'application/problem+json' }
      });
    }

    // 2. Validación de esquema de la firma
    const parseResult = SignatureRecordSchema.safeParse(body.signature);
    if (!parseResult.success) {
      return new Response(JSON.stringify({
        type: 'https://pactio.lat/errors/invalid-signature-payload',
        title: 'Payload de Firma Inválido',
        status: 422,
        errors: parseResult.error.flatten()
      }), {
        status: 422,
        headers: { 'Content-Type': 'application/problem+json' }
      });
    }

    const signature = parseResult.data;
    const signerRole = signature.signerRole; // 'creator' | 'client'
    const nowIso = new Date().toISOString();

    // 3. Almacenar firma en el contrato
    contract.signatures[signerRole] = signature;
    contract.updatedAt = nowIso;

    // 4. Asentar evento de firma en Audit Trail
    const lastEvent = contract.auditTrail[contract.auditTrail.length - 1];
    const prevHash = lastEvent ? lastEvent.currentEventHash : 'GENESIS_BLOCK';
    const signAction = signerRole === 'creator' ? 'SIGNATURE_SUBMITTED_CREATOR' : 'SIGNATURE_SUBMITTED_CLIENT';
    const auditSignId = `evt_${randomUUID()}`;

    const signerEmail = (signature.type === 'biometric_vector' ? signature.signerEmail : signature.signerEmail) || 
      (signerRole === 'creator' ? contract.parties.creator.email : contract.parties.client.email);

    const signEventHash = computeEventHash({
      eventId: auditSignId,
      sequenceIndex: contract.auditTrail.length,
      timestamp: nowIso,
      action: signAction,
      actorEmail: signerEmail,
      documentHashAtEvent: contract.documentHash,
      previousEventHash: prevHash
    });

    const signAuditEvent: AuditEvent = {
      eventId: auditSignId,
      contractId: contract.id,
      contractCode: contract.contractCode,
      version: `${contract.versionMajor}.${contract.versionMinor}`,
      sequenceIndex: contract.auditTrail.length,
      action: signAction,
      actor: {
        role: signerRole,
        email: signerEmail
      },
      metadata: {
        ipAddress: req.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1',
        userAgent: req.headers.get('user-agent') || 'Pactio-Signer-Client',
        timestamp: nowIso
      },
      documentHashAtEvent: contract.documentHash,
      previousEventHash: prevHash,
      currentEventHash: signEventHash
    };

    contract.auditTrail.push(signAuditEvent);

    // 5. Determinar estado y comprobar si ambas partes han firmado
    const hasCreatorSigned = !!contract.signatures.creator;
    const hasClientSigned = !!contract.signatures.client;

    if (hasCreatorSigned && hasClientSigned) {
      // Ambas firmas reunidas: Transición a proceso de timbrado NOM-151
      contract.status = 'SIGNED_BOTH_PENDING_PSC';

      // 6. Solicitud al Proveedor de Servicios de Certificación (PSC)
      const pscStamp = await nom151MockService.requestTimestamp({
        documentHash: contract.documentHash,
        contractCode: contract.contractCode
      });

      contract.nom151Stamp = pscStamp;
      contract.status = 'COMPLETED_NOM151';

      // 7. Evento de constancia NOM-151 en el Audit Trail
      const pscEventId = `evt_${randomUUID()}`;
      const pscPrevHash = signAuditEvent.currentEventHash;
      const pscHash = computeEventHash({
        eventId: pscEventId,
        sequenceIndex: contract.auditTrail.length,
        timestamp: pscStamp.cenamTimestamp,
        action: 'PSC_TIMESTAMP_ATTACHED',
        actorEmail: 'tsa@se.nom151.pactio.lat',
        documentHashAtEvent: contract.documentHash,
        previousEventHash: pscPrevHash
      });

      const pscAuditEvent: AuditEvent = {
        eventId: pscEventId,
        contractId: contract.id,
        contractCode: contract.contractCode,
        version: `${contract.versionMajor}.${contract.versionMinor}`,
        sequenceIndex: contract.auditTrail.length,
        action: 'PSC_TIMESTAMP_ATTACHED',
        actor: {
          role: 'system',
          email: 'tsa@se.nom151.pactio.lat',
          identifier: pscStamp.tsaIdentifier
        },
        metadata: {
          ipAddress: '127.0.0.1',
          userAgent: 'Pactio-PSC-Worker/1.0',
          timestamp: pscStamp.cenamTimestamp
        },
        documentHashAtEvent: contract.documentHash,
        previousEventHash: pscPrevHash,
        currentEventHash: pscHash
      };

      contract.auditTrail.push(pscAuditEvent);
    } else {
      // Solo una parte ha firmado hasta ahora
      contract.status = signerRole === 'creator' ? 'SIGNED_CREATOR' : 'SIGNED_CLIENT';
    }

    await contractRepository.save(contract);

    return new Response(JSON.stringify({
      success: true,
      contractStatus: contract.status,
      signedBy: signerRole,
      nom151Stamp: contract.nom151Stamp || null,
      bothSigned: hasCreatorSigned && hasClientSigned
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    return new Response(JSON.stringify({
      type: 'https://pactio.lat/errors/sign-error',
      title: 'Error Procesando Firma Digital',
      status: 500,
      detail: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/problem+json' }
    });
  }
}
