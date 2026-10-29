import { describe, it, expect, beforeEach } from 'vitest';
import { POST as createContractHandler } from '../src/app/api/v1/contracts/route.js';
import { POST as adjustContractHandler } from '../src/app/api/v1/contracts/[code]/adjust/route.js';
import { POST as signContractHandler } from '../src/app/api/v1/contracts/[code]/sign/route.js';
import { contractRepository } from '../src/core/db/contract-repository.js';
import type { BiometricSignature } from '../src/core/schemas/signature.js';

describe('Endpoints RESTful & Integración E2E', () => {
  beforeEach(() => {
    contractRepository.clear();
  });

  const validContractInput = {
    parties: {
      creator: {
        role: 'creator',
        personType: 'physical',
        legalName: 'Sofía Valenzuela Mendoza',
        rfc: 'VAMS9005128D1',
        email: 'sofia@uxstudio.mx',
        address: {
          street: 'Álvaro Obregón',
          exteriorNumber: '151',
          neighborhood: 'Roma Norte',
          municipality: 'Cuauhtémoc',
          state: 'CDMX',
          postalCode: '06700',
          country: 'México'
        }
      },
      client: {
        role: 'client',
        personType: 'moral',
        legalName: 'Innovaciones Digitales del Norte S.A. de C.V.',
        rfc: 'IDN180620TX6',
        email: 'mario@novatech.mx',
        address: {
          street: 'Av. Constitución',
          exteriorNumber: '2000',
          neighborhood: 'Obispado',
          municipality: 'Monterrey',
          state: 'NL',
          postalCode: '64060',
          country: 'México'
        }
      }
    },
    scope: {
      projectTitle: 'Rediseño Integral de Aplicación Móvil',
      serviceCategory: 'ux_ui_design',
      description: 'Consultoría y diseño de interfaz de usuario y arquitectura de información.',
      deliverablesSummary: ['Figma UI Kit', 'Design Tokens'],
      requiredClientInputs: ['Brand guide', 'Accesos'],
      outOfScope: ['Backend', 'Servidores'],
      startDateTrigger: 'upon_inputs_received'
    },
    payments: {
      currency: 'MXN',
      totalAmountCents: 2000000, // $20,000.00 MXN
      model: 'fixed_50_50',
      milestones: [
        {
          id: 'm1',
          order: 1,
          title: 'Hito Inicial',
          percentage: 50,
          amountCents: 1000000,
          deliverables: ['Wireframes'],
          status: 'pending'
        },
        {
          id: 'm2',
          order: 2,
          title: 'Hito Final',
          percentage: 50,
          amountCents: 1000000,
          deliverables: ['UI Final'],
          status: 'pending'
        }
      ]
    }
  };

  it('crea un contrato exitosamente con POST /api/v1/contracts', async () => {
    const req = new Request('http://localhost:3000/api/v1/contracts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validContractInput)
    });

    const res = await createContractHandler(req);
    expect(res.status).toBe(201);

    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.contractCode).toMatch(/^PACT-[0-9A-HJKMNP-TV-Z]{5}$/);
    expect(body.data.status).toBe('DRAFT');
    expect(body.data.documentHash).toHaveLength(64);
    expect(body.data.auditTrail).toHaveLength(1);
    expect(body.data.auditTrail[0].action).toBe('CONTRACT_CREATED');
  });

  it('procesa sugerencias de ajuste válidas con POST /api/v1/contracts/[code]/adjust', async () => {
    // 1. Crear contrato
    const createReq = new Request('http://localhost:3000/api/v1/contracts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validContractInput)
    });
    const createRes = await createContractHandler(createReq);
    const { data: contract } = await createRes.json();
    const code = contract.contractCode;

    // Simular transición a revisión del cliente
    await contractRepository.updateStatus(code, 'PENDING_CLIENT_REVIEW');

    // 2. Cliente sugiere ajuste en gobernanza de revisiones
    const adjustReq = new Request(`http://localhost:3000/api/v1/contracts/${code}/adjust`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        field: 'governance.includedRevisionRounds',
        originalValue: 2,
        suggestedValue: 3,
        reason: 'Requerimos 3 rondas por políticas corporativas de validación de diseño.',
        suggestedBy: 'client'
      })
    });

    const adjustRes = await adjustContractHandler(adjustReq, { params: { code } });
    expect(adjustRes.status).toBe(200);

    const adjustBody = await adjustRes.json();
    expect(adjustBody.success).toBe(true);
    expect(adjustBody.contractStatus).toBe('ADJUSTMENT_REQUESTED');
    expect(adjustBody.version).toBe('v1.1');

    const updated = await contractRepository.findByCode(code);
    expect(updated?.auditTrail).toHaveLength(2);
    expect(updated?.auditTrail[1].action).toBe('ADJUSTMENT_SUGGESTED');
  });

  it('bloquea intentos de alterar campos inmutables como el RFC o transferencia de IP', async () => {
    // 1. Crear contrato
    const createReq = new Request('http://localhost:3000/api/v1/contracts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validContractInput)
    });
    const createRes = await createContractHandler(createReq);
    const { data: contract } = await createRes.json();
    const code = contract.contractCode;

    // 2. Intento de modificar la regla de oro de Propiedad Intelectual
    const forbiddenReq = new Request(`http://localhost:3000/api/v1/contracts/${code}/adjust`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        field: 'intellectualProperty.transferTiming',
        originalValue: 'upon_final_payment',
        suggestedValue: 'upon_start',
        reason: 'Queremos los derechos desde el día 1.',
        suggestedBy: 'client'
      })
    });

    const forbiddenRes = await adjustContractHandler(forbiddenReq, { params: { code } });
    expect(forbiddenRes.status).toBe(403);

    const body = await forbiddenRes.json();
    expect(body.title).toBe('Campo Inmutable por Reglas de Gobernanza');
  });

  it('procesa el flujo completo de firma bilateral y timbrado NOM-151 con estampa CENAM', async () => {
    // 1. Crear contrato
    const createReq = new Request('http://localhost:3000/api/v1/contracts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validContractInput)
    });
    const createRes = await createContractHandler(createReq);
    const { data: contract } = await createRes.json();
    const code = contract.contractCode;
    const docHash = contract.documentHash;

    const dummySignature: BiometricSignature = {
      type: 'biometric_vector',
      signerRole: 'creator',
      signerName: 'Sofía Valenzuela Mendoza',
      signerEmail: 'sofia@uxstudio.mx',
      strokes: [[{ x: 0.1, y: 0.2, time: 50, pressure: 0.8 }]],
      svgPathData: 'M 10 20 L 50 60',
      signedAt: new Date().toISOString(),
      ipAddress: '201.175.42.18',
      userAgent: 'Mozilla/5.0'
    };

    // 2. Firma del Creador
    const sign1Req = new Request(`http://localhost:3000/api/v1/contracts/${code}/sign`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        documentHash: docHash,
        signature: dummySignature
      })
    });

    const sign1Res = await signContractHandler(sign1Req, { params: { code } });
    expect(sign1Res.status).toBe(200);
    const sign1Body = await sign1Res.json();
    expect(sign1Body.contractStatus).toBe('SIGNED_CREATOR');
    expect(sign1Body.bothSigned).toBe(false);

    // 3. Firma del Cliente (Cierra el ciclo bilateral y dispara el timbrado NOM-151)
    const clientSignature: BiometricSignature = {
      ...dummySignature,
      signerRole: 'client',
      signerName: 'Mario Rodríguez (Director General NovaTech)',
      signerEmail: 'mario@novatech.mx'
    };

    const sign2Req = new Request(`http://localhost:3000/api/v1/contracts/${code}/sign`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        documentHash: docHash,
        signature: clientSignature
      })
    });

    const sign2Res = await signContractHandler(sign2Req, { params: { code } });
    expect(sign2Res.status).toBe(200);
    const sign2Body = await sign2Res.json();
    expect(sign2Body.bothSigned).toBe(true);
    expect(sign2Body.contractStatus).toBe('COMPLETED_NOM151');
    expect(sign2Body.nom151Stamp).not.toBeNull();
    expect(sign2Body.nom151Stamp.constanciaId).toContain(`NOM151-${code}`);
    expect(sign2Body.nom151Stamp.cenamTimestamp).toBeDefined();

    // 4. Verificar estado final persistido
    const completedContract = await contractRepository.findByCode(code);
    expect(completedContract?.status).toBe('COMPLETED_NOM151');
    expect(completedContract?.nom151Stamp?.documentHash).toBe(docHash);
    expect(completedContract?.auditTrail.map(e => e.action)).toEqual([
      'CONTRACT_CREATED',
      'SIGNATURE_SUBMITTED_CREATOR',
      'SIGNATURE_SUBMITTED_CLIENT',
      'PSC_TIMESTAMP_ATTACHED'
    ]);
  });

  it('detecta y aborta la firma si el hash del documento difiere (Tampering Prevention)', async () => {
    // 1. Crear contrato
    const createReq = new Request('http://localhost:3000/api/v1/contracts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validContractInput)
    });
    const createRes = await createContractHandler(createReq);
    const { data: contract } = await createRes.json();
    const code = contract.contractCode;

    // 2. Intento de firmar enviando un hash adulterado
    const tamperReq = new Request(`http://localhost:3000/api/v1/contracts/${code}/sign`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        documentHash: 'deadbeef'.repeat(8),
        signature: {
          type: 'biometric_vector',
          signerRole: 'creator',
          signerName: 'Sofía Valenzuela',
          signerEmail: 'sofia@uxstudio.mx',
          strokes: [[{ x: 0.1, y: 0.1, time: 10, pressure: 0.5 }]],
          svgPathData: 'M 1 1',
          signedAt: new Date().toISOString(),
          ipAddress: '127.0.0.1',
          userAgent: 'Test'
        }
      })
    });

    const tamperRes = await signContractHandler(tamperReq, { params: { code } });
    expect(tamperRes.status).toBe(409);
    const body = await tamperRes.json();
    expect(body.title).toBe('Violación de Integridad en Documento');
  });
});
