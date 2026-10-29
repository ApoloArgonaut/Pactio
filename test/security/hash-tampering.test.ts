import { describe, it, expect, beforeEach } from 'vitest';
import {
  compileToCanonicalPlainText,
  compileToCanonicalMarkdown,
  generateDocumentHash
} from '../../src/core/compiler/dual-compiler.js';
import { nom151MockService } from '../../src/core/psc/nom151-mock.js';
import { computeEventHash, verifyAuditChainIntegrity, type AuditEvent } from '../../src/core/schemas/audit.js';
import { isDocumentFrozen, assertCanTransition, canTransition } from '../../src/core/fsm/contract-fsm.js';
import { contractRepository } from '../../src/core/db/contract-repository.js';
import { POST as signRoute } from '../../src/app/api/v1/contracts/[code]/sign/route.js';
import { createValidTestContract } from './fixtures.js';

describe('AppSec Audit: Integridad Criptográfica de Hashes SHA-256 y Anti-Tampering', () => {
  beforeEach(() => {
    contractRepository.clear();
  });

  describe('Propiedades Criptográficas del Hash Canónico (SHA-256)', () => {
    it('debe ser estrictamente determinista ante representaciones canónicas idénticas', () => {
      const contractA = createValidTestContract();
      const contractB = createValidTestContract();

      const textA = compileToCanonicalPlainText(contractA);
      const textB = compileToCanonicalPlainText(contractB);

      const hashA = generateDocumentHash(textA);
      const hashB = generateDocumentHash(textB);

      expect(hashA).toBe(hashB);
      expect(hashA).toMatch(/^[0-9a-f]{64}$/);
    });

    it('debe exhibir efecto avalancha: alterar 1 solo centavo o carácter debe transformar radicalmente el hash', () => {
      const contractOriginal = createValidTestContract();
      const contractAltered = createValidTestContract({
        payments: {
          ...contractOriginal.payments,
          totalAmountCents: 3000001 // 1 centavo adicional ($30,000.01 vs $30,000.00)
        }
      });

      const hashOriginal = generateDocumentHash(compileToCanonicalPlainText(contractOriginal));
      const hashAltered = generateDocumentHash(compileToCanonicalPlainText(contractAltered));

      expect(hashOriginal).not.toBe(hashAltered);

      // Calcular diferencia de bits entre ambos hashes hexadecimales
      let differingChars = 0;
      for (let i = 0; i < 64; i++) {
        if (hashOriginal[i] !== hashAltered[i]) differingChars++;
      }
      // Efecto avalancha: la inmensa mayoría de caracteres hex deben diferir
      expect(differingChars).toBeGreaterThan(45);
    });

    it('debe detectar alteraciones en cláusulas de Propiedad Intelectual o Gobernanza', () => {
      const contractOriginal = createValidTestContract();
      const contractAltered = createValidTestContract({
        governance: {
          ...contractOriginal.governance,
          killFeePercentage: 25 // Alterado de 50% a 25%
        }
      });

      const hashOriginal = generateDocumentHash(compileToCanonicalPlainText(contractOriginal));
      const hashAltered = generateDocumentHash(compileToCanonicalPlainText(contractAltered));

      expect(hashOriginal).not.toBe(hashAltered);
    });
  });

  describe('Detección de Tampering en el Endpoint de Firma (/contracts/[code]/sign)', () => {
    it('debe rechazar con HTTP 409 cuando el documentHash enviado no coincide con el digest del servidor', async () => {
      const contract = createValidTestContract({
        contractCode: 'PACT-TAMPR1',
        status: 'PENDING_SIGNATURE'
      });
      contract.canonicalMarkdown = compileToCanonicalMarkdown(contract);
      contract.canonicalPlainText = compileToCanonicalPlainText(contract);
      contract.documentHash = generateDocumentHash(contract.canonicalPlainText);

      await contractRepository.save(contract);

      // El atacante envía un hash alterado pretendiendo haber firmado otra versión del documento
      const fakeHash = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';

      const request = new Request('https://pactio.lat/api/v1/contracts/PACT-TAMPR1/sign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentHash: fakeHash,
          signature: {
            type: 'biometric_vector',
            signerRole: 'client',
            signerName: 'Mario Nova',
            signerEmail: 'mario.contacto@novatech.mx',
            strokes: [[{ x: 0.1, y: 0.2, time: 100, pressure: 0.8 }]],
            svgPathData: 'M 10 20 L 30 40',
            signedAt: new Date().toISOString(),
            ipAddress: '192.168.1.1',
            userAgent: 'Mozilla/5.0'
          }
        })
      });

      const response = await signRoute(request, { params: { code: 'PACT-TAMPR1' } });
      expect(response.status).toBe(409);

      const json = await response.json();
      expect(json.type).toBe('https://pactio.lat/errors/tampering-detected');
      expect(json.title).toContain('Violación de Integridad');
    });

    it('debe aceptar y procesar cuando el documentHash coincide exactamente con el digest registrado', async () => {
      const contract = createValidTestContract({
        contractCode: 'PACT-LEGIT1',
        status: 'PENDING_SIGNATURE'
      });
      contract.canonicalMarkdown = compileToCanonicalMarkdown(contract);
      contract.canonicalPlainText = compileToCanonicalPlainText(contract);
      contract.documentHash = generateDocumentHash(contract.canonicalPlainText);

      await contractRepository.save(contract);

      const request = new Request('https://pactio.lat/api/v1/contracts/PACT-LEGIT1/sign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentHash: contract.documentHash, // Hash legítimo y coincidente
          signature: {
            type: 'biometric_vector',
            signerRole: 'creator',
            signerName: 'Sofía Valenzuela',
            signerEmail: 'sofia@uxstudio.mx',
            strokes: [[{ x: 0.2, y: 0.3, time: 150, pressure: 0.9 }]],
            svgPathData: 'M 20 30 L 50 60',
            signedAt: new Date().toISOString(),
            ipAddress: '127.0.0.1',
            userAgent: 'Mozilla/5.0'
          }
        })
      });

      const response = await signRoute(request, { params: { code: 'PACT-LEGIT1' } });
      expect(response.status).toBe(200);

      const json = await response.json();
      expect(json.success).toBe(true);
      expect(json.signedBy).toBe('creator');
      expect(json.contractStatus).toBe('SIGNED_CREATOR');
    });
  });

  describe('Verificación de Constancia de Sellado NOM-151 (PSC Mock)', () => {
    it('debe verificar exitosamente una constancia NOM-151 con hash inalterado', async () => {
      const docHash = generateDocumentHash('Texto legal pactado conforme a NOM-151');
      const stamp = await nom151MockService.requestTimestamp({
        documentHash: docHash,
        contractCode: 'PACT-NOM1'
      });

      const result = nom151MockService.verifyStamp(stamp, docHash);
      expect(result.valid).toBe(true);
      expect(result.cenamTime).toBeDefined();
    });

    it('debe detectar manipulación si el hash actual del documento no coincide con la constancia', async () => {
      const originalHash = generateDocumentHash('Texto original 1');
      const alteredHash = generateDocumentHash('Texto alterado maliciosamente 2');

      const stamp = await nom151MockService.requestTimestamp({
        documentHash: originalHash,
        contractCode: 'PACT-NOM2'
      });

      const result = nom151MockService.verifyStamp(stamp, alteredHash);
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('Violación de Integridad');
    });

    it('debe rechazar solicitudes con hashes inválidos o malformados en requestTimestamp', async () => {
      await expect(nom151MockService.requestTimestamp({
        documentHash: 'short-hash',
        contractCode: 'PACT-ERR'
      })).rejects.toThrow(/Hash inválido para timbrado NOM-151/);

      await expect(nom151MockService.requestTimestamp({
        documentHash: 'z'.repeat(64), // 64 caracteres pero no hexadecimal
        contractCode: 'PACT-ERR'
      })).rejects.toThrow(/Hash inválido para timbrado NOM-151/);
    });
  });

  describe('Inmutabilidad de la Cadena de Auditoría (Merkle Hash Chaining)', () => {
    it('debe validar la integridad de una cadena de auditoría consecutiva intacta', () => {
      const docHash = generateDocumentHash('Contrato v1.0');
      const timestamp1 = '2026-10-29T10:00:00.000Z';
      const timestamp2 = '2026-10-29T10:05:00.000Z';

      const event1Hash = computeEventHash({
        eventId: 'evt_1',
        sequenceIndex: 0,
        timestamp: timestamp1,
        action: 'CONTRACT_CREATED',
        actorEmail: 'sofia@uxstudio.mx',
        documentHashAtEvent: docHash,
        previousEventHash: 'GENESIS_BLOCK'
      });

      const event1: AuditEvent = {
        eventId: 'evt_1',
        contractId: 'c-1',
        contractCode: 'PACT-AUDIT1',
        version: '1.0',
        sequenceIndex: 0,
        action: 'CONTRACT_CREATED',
        actor: { role: 'creator', email: 'sofia@uxstudio.mx' },
        metadata: { ipAddress: '127.0.0.1', userAgent: 'test', timestamp: timestamp1 },
        documentHashAtEvent: docHash,
        previousEventHash: 'GENESIS_BLOCK',
        currentEventHash: event1Hash
      };

      const event2Hash = computeEventHash({
        eventId: 'evt_2',
        sequenceIndex: 1,
        timestamp: timestamp2,
        action: 'SENT_TO_REVIEW',
        actorEmail: 'sofia@uxstudio.mx',
        documentHashAtEvent: docHash,
        previousEventHash: event1Hash
      });

      const event2: AuditEvent = {
        eventId: 'evt_2',
        contractId: 'c-1',
        contractCode: 'PACT-AUDIT1',
        version: '1.0',
        sequenceIndex: 1,
        action: 'SENT_TO_REVIEW',
        actor: { role: 'creator', email: 'sofia@uxstudio.mx' },
        metadata: { ipAddress: '127.0.0.1', userAgent: 'test', timestamp: timestamp2 },
        documentHashAtEvent: docHash,
        previousEventHash: event1Hash,
        currentEventHash: event2Hash
      };

      const verification = verifyAuditChainIntegrity([event1, event2]);
      expect(verification.valid).toBe(true);
    });

    it('debe detectar manipulación si un actor o acción es alterado en un bloque previo', () => {
      const docHash = generateDocumentHash('Contrato v1.0');
      const timestamp1 = '2026-10-29T10:00:00.000Z';

      const event1Hash = computeEventHash({
        eventId: 'evt_1',
        sequenceIndex: 0,
        timestamp: timestamp1,
        action: 'CONTRACT_CREATED',
        actorEmail: 'sofia@uxstudio.mx',
        documentHashAtEvent: docHash,
        previousEventHash: 'GENESIS_BLOCK'
      });

      const event1: AuditEvent = {
        eventId: 'evt_1',
        contractId: 'c-1',
        contractCode: 'PACT-AUDIT1',
        version: '1.0',
        sequenceIndex: 0,
        action: 'CONTRACT_CREATED',
        actor: { role: 'creator', email: 'sofia@uxstudio.mx' },
        metadata: { ipAddress: '127.0.0.1', userAgent: 'test', timestamp: timestamp1 },
        documentHashAtEvent: docHash,
        previousEventHash: 'GENESIS_BLOCK',
        currentEventHash: event1Hash
      };

      // Alteración no autorizada del autor en el evento 1 sin recalcular el hash
      const tamperedEvent1 = {
        ...event1,
        actor: { role: 'creator' as const, email: 'hacker@attacker.com' }
      };

      const verification = verifyAuditChainIntegrity([tamperedEvent1]);
      expect(verification.valid).toBe(false);
      expect(verification.brokenIndex).toBe(0);
    });
  });

  describe('Inmutabilidad en la FSM (Frozen States)', () => {
    it('debe marcar estados post-firma y NOM-151 como estrictamente congelados', () => {
      expect(isDocumentFrozen('DRAFT')).toBe(false);
      expect(isDocumentFrozen('PENDING_CLIENT_REVIEW')).toBe(false);
      expect(isDocumentFrozen('ADJUSTMENT_REQUESTED')).toBe(false);

      expect(isDocumentFrozen('PENDING_SIGNATURE')).toBe(true);
      expect(isDocumentFrozen('SIGNED_CREATOR')).toBe(true);
      expect(isDocumentFrozen('SIGNED_CLIENT')).toBe(true);
      expect(isDocumentFrozen('SIGNED_BOTH_PENDING_PSC')).toBe(true);
      expect(isDocumentFrozen('COMPLETED_NOM151')).toBe(true);
    });

    it('debe prohibir transiciones ilegales desde estados terminales inmutables', () => {
      expect(canTransition('COMPLETED_NOM151', 'DRAFT')).toBe(false);
      expect(canTransition('COMPLETED_NOM151', 'PENDING_CLIENT_REVIEW')).toBe(false);

      expect(() => assertCanTransition('COMPLETED_NOM151', 'DRAFT')).toThrow(/Transición de estado ilegal/);
    });
  });
});
