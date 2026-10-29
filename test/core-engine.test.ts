import { describe, it, expect } from 'vitest';
import {
  generateContractCode,
  normalizeContractCode,
  isValidContractCode,
  calculateCollisionProbability,
  CROCKFORD_BASE32_ALPHABET
} from '../src/core/crypto/nanoid.js';
import {
  PartySchema,
  SAT_RFC_REGEX,
  validateSatRfcChecksum
} from '../src/core/schemas/party.js';
import { PaymentPlanSchema } from '../src/core/schemas/milestone.js';
import {
  compileToCanonicalMarkdown,
  compileToCanonicalPlainText,
  compileToHumanMarkdown,
  generateDocumentHash
} from '../src/core/compiler/dual-compiler.js';
import {
  canTransition,
  assertCanTransition,
  isDocumentFrozen
} from '../src/core/fsm/contract-fsm.js';
import { nom151MockService } from '../src/core/psc/nom151-mock.js';
import {
  computeEventHash,
  verifyAuditChainIntegrity,
  type AuditEvent
} from '../src/core/schemas/audit.js';
import { useContractStore } from '../src/core/store/contract-store.js';

describe('1. NanoID en Crockford Base32 (PACT-XXXXX)', () => {
  it('genera códigos con formato PACT-XXXXX válido de 5 caracteres Crockford', () => {
    for (let i = 0; i < 50; i++) {
      const code = generateContractCode(5);
      expect(code).toMatch(/^PACT-[0-9A-HJKMNP-TV-Z]{5}$/);
      expect(isValidContractCode(code)).toBe(true);
    }
  });

  it('excluye rigurosamente los caracteres ambiguos I, L, O, U', () => {
    for (let i = 0; i < 100; i++) {
      const code = generateContractCode(5);
      expect(code).not.toMatch(/[ILOU]/);
    }
  });

  it('normaliza entradas humanas con minúsculas y caracteres confusos', () => {
    // 'pact-8ilo0' debe normalizarse reemplazando I->1, L->1, O->0
    const normalized = normalizeContractCode('pact-8ilo0');
    expect(normalized).toBe('PACT-81100');

    // Sin prefijo: '8x9k2' -> 'PACT-8X9K2'
    const normalizedNoPrefix = normalizeContractCode('8x9k2');
    expect(normalizedNoPrefix).toBe('PACT-8X9K2');
  });

  it('calcula la probabilidad matemática de colisión de forma consistente', () => {
    const prob1000 = calculateCollisionProbability(1000, 5);
    // Para 1,000 contratos en 32^5 (33.5M), P ≈ 1.48%
    expect(prob1000).toBeGreaterThan(0.01);
    expect(prob1000).toBeLessThan(0.02);

    const prob100 = calculateCollisionProbability(100, 5);
    expect(prob100).toBeLessThan(0.0002);
  });
});

describe('2. Validación de Esquemas Zod y Reglas SAT', () => {
  it('valida RFC de Persona Física y Moral con regex oficial SAT', () => {
    expect(SAT_RFC_REGEX.test('VAMS9005128D3')).toBe(true); // Física (13 chars)
    expect(SAT_RFC_REGEX.test('IDN180620TX9')).toBe(true);  // Moral (12 chars)
    expect(SAT_RFC_REGEX.test('INVALID_RFC')).toBe(false);
  });

  it('valida algoritmo Módulo 11 del SAT en RFCs válidos', () => {
    expect(validateSatRfcChecksum('VAMS9005128D1')).toBe(true);
    expect(validateSatRfcChecksum('IDN180620TX6')).toBe(true);
    expect(validateSatRfcChecksum('GARM920315HA0')).toBe(true);
    // RFC con dígito verificador adulterado
    expect(validateSatRfcChecksum('VAMS9005128D9')).toBe(false);
    expect(validateSatRfcChecksum('IDN180620TX0')).toBe(false);
  });

  it('valida el esquema de Party con dirección y RFC', () => {
    const validParty = {
      role: 'creator' as const,
      personType: 'physical' as const,
      legalName: 'Sofía Valenzuela Mendoza',
      rfc: 'VAMS9005128D3',
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
    };

    const parsed = PartySchema.safeParse(validParty);
    expect(parsed.success).toBe(true);
  });

  it('rechaza planes de pago cuya suma de porcentajes no sea 100%', () => {
    const invalidPlan = {
      currency: 'MXN' as const,
      totalAmountCents: 3000000,
      model: 'milestones' as const,
      milestones: [
        {
          id: 'm1',
          order: 1,
          title: 'Anticipo',
          deliverables: ['Plan inicial'],
          percentage: 60, // 60 + 50 = 110% (Inválido)
          amountCents: 1800000,
          status: 'pending' as const
        },
        {
          id: 'm2',
          order: 2,
          title: 'Entrega Final',
          deliverables: ['Código'],
          percentage: 50,
          amountCents: 1500000,
          status: 'pending' as const
        }
      ]
    };

    const parsed = PaymentPlanSchema.safeParse(invalidPlan);
    expect(parsed.success).toBe(false);
  });

  it('acepta planes de pago consistentes al 100% en porcentajes y centavos', () => {
    const validPlan = {
      currency: 'MXN' as const,
      totalAmountCents: 3000000,
      model: 'fixed_50_50' as const,
      milestones: [
        {
          id: 'm1',
          order: 1,
          title: 'Anticipo 50%',
          deliverables: ['Wireframes'],
          percentage: 50,
          amountCents: 1500000,
          status: 'pending' as const
        },
        {
          id: 'm2',
          order: 2,
          title: 'Finiquito 50%',
          deliverables: ['Entrega final'],
          percentage: 50,
          amountCents: 1500000,
          status: 'pending' as const
        }
      ]
    };

    const parsed = PaymentPlanSchema.safeParse(validPlan);
    expect(parsed.success).toBe(true);
  });
});

describe('3. Compilador Dual y Huella Digital Criptográfica', () => {
  it('genera representaciones canónicas deterministas e inmutables', () => {
    const contract = useContractStore.getState().toContractData();
    const md = compileToCanonicalMarkdown(contract);
    const plain = compileToCanonicalPlainText(contract);
    const human = compileToHumanMarkdown(contract);

    expect(md).toContain('CONTRATO DE PRESTACIÓN DE SERVICIOS PROFESIONALES');
    expect(md).toContain('PRIMERA. OBJETO DEL CONTRATO');
    expect(md).toContain('Artículo 83 de la Ley Federal del Derecho de Autor');

    expect(plain).not.toContain('**'); // Sin asteriscos de markdown
    expect(human).toContain('🤝 Resumen Claro del Acuerdo (Vista Humana)');
    expect(human).toContain('Regla de Oro');

    const hash1 = generateDocumentHash(plain);
    const hash2 = generateDocumentHash(plain);
    expect(hash1).toBe(hash2);
    expect(hash1).toHaveLength(64);
  });
});

describe('4. Máquina de Estados (FSM) y Congelamiento de Documento', () => {
  it('permite transiciones válidas según el ciclo de vida', () => {
    expect(canTransition('DRAFT', 'PENDING_CLIENT_REVIEW')).toBe(true);
    expect(canTransition('PENDING_CLIENT_REVIEW', 'ADJUSTMENT_REQUESTED')).toBe(true);
    expect(canTransition('ADJUSTMENT_REQUESTED', 'COUNTER_PROPOSED')).toBe(true);
    expect(canTransition('PENDING_SIGNATURE', 'SIGNED_CREATOR')).toBe(true);
    expect(canTransition('SIGNED_BOTH_PENDING_PSC', 'COMPLETED_NOM151')).toBe(true);
  });

  it('bloquea transiciones ilegales lanzando excepciones', () => {
    expect(canTransition('DRAFT', 'COMPLETED_NOM151')).toBe(false);
    expect(() => assertCanTransition('DRAFT', 'COMPLETED_NOM151')).toThrowError();
  });

  it('identifica correctamente los estados congelados donde el texto no puede alterarse', () => {
    expect(isDocumentFrozen('DRAFT')).toBe(false);
    expect(isDocumentFrozen('PENDING_SIGNATURE')).toBe(true);
    expect(isDocumentFrozen('SIGNED_CREATOR')).toBe(true);
    expect(isDocumentFrozen('COMPLETED_NOM151')).toBe(true);
  });
});

describe('5. Integración Mock de NOM-151 con Estampa CENAM', () => {
  it('emite constancias NOM-151 con hash coincidente y estampa CENAM', async () => {
    const testHash = 'a'.repeat(64);
    const stamp = await nom151MockService.requestTimestamp({
      documentHash: testHash,
      contractCode: 'PACT-8X9K2'
    });

    expect(stamp.documentHash).toBe(testHash);
    expect(stamp.constanciaId).toContain('NOM151-PACT-8X9K2');
    expect(stamp.cenamTimestamp).toBeDefined();
    expect(stamp.asn1DerBase64.length).toBeGreaterThan(50);

    // Verificación de constancia válida
    const verification = nom151MockService.verifyStamp(stamp, testHash);
    expect(verification.valid).toBe(true);
  });

  it('detecta alteraciones de contenido rechazando constancias adulteradas', async () => {
    const originalHash = 'b'.repeat(64);
    const tamperedHash = 'c'.repeat(64);

    const stamp = await nom151MockService.requestTimestamp({
      documentHash: originalHash,
      contractCode: 'PACT-TAMPR'
    });

    const verification = nom151MockService.verifyStamp(stamp, tamperedHash);
    expect(verification.valid).toBe(false);
    expect(verification.reason).toContain('Violación de Integridad');
  });
});

describe('6. Cadena de Auditoría Criptográfica (Hash Chaining)', () => {
  it('valida la integridad de una cadena de auditoría legítima', () => {
    const nowIso = new Date().toISOString();
    const docHash = 'd'.repeat(64);

    const event0Hash = computeEventHash({
      eventId: 'evt-0',
      sequenceIndex: 0,
      timestamp: nowIso,
      action: 'CONTRACT_CREATED',
      actorEmail: 'sofia@uxstudio.mx',
      documentHashAtEvent: docHash,
      previousEventHash: 'GENESIS_BLOCK'
    });

    const event0: AuditEvent = {
      eventId: 'evt-0',
      contractId: 'ctr-123',
      contractCode: 'PACT-TEST1',
      version: '1.0',
      sequenceIndex: 0,
      action: 'CONTRACT_CREATED',
      actor: { role: 'creator', email: 'sofia@uxstudio.mx' },
      metadata: { ipAddress: '127.0.0.1', userAgent: 'TestRunner', timestamp: nowIso },
      documentHashAtEvent: docHash,
      previousEventHash: 'GENESIS_BLOCK',
      currentEventHash: event0Hash
    };

    const event1Hash = computeEventHash({
      eventId: 'evt-1',
      sequenceIndex: 1,
      timestamp: nowIso,
      action: 'SENT_TO_REVIEW',
      actorEmail: 'sofia@uxstudio.mx',
      documentHashAtEvent: docHash,
      previousEventHash: event0Hash
    });

    const event1: AuditEvent = {
      eventId: 'evt-1',
      contractId: 'ctr-123',
      contractCode: 'PACT-TEST1',
      version: '1.0',
      sequenceIndex: 1,
      action: 'SENT_TO_REVIEW',
      actor: { role: 'creator', email: 'sofia@uxstudio.mx' },
      metadata: { ipAddress: '127.0.0.1', userAgent: 'TestRunner', timestamp: nowIso },
      documentHashAtEvent: docHash,
      previousEventHash: event0Hash,
      currentEventHash: event1Hash
    };

    const trail = [event0, event1];
    const result = verifyAuditChainIntegrity(trail);
    expect(result.valid).toBe(true);
  });

  it('detecta un eslabón roto si un atacante altera un registro previo', () => {
    const nowIso = new Date().toISOString();
    const docHash = 'd'.repeat(64);

    const event0Hash = computeEventHash({
      eventId: 'evt-0',
      sequenceIndex: 0,
      timestamp: nowIso,
      action: 'CONTRACT_CREATED',
      actorEmail: 'sofia@uxstudio.mx',
      documentHashAtEvent: docHash,
      previousEventHash: 'GENESIS_BLOCK'
    });

    const event0: AuditEvent = {
      eventId: 'evt-0',
      contractId: 'ctr-123',
      contractCode: 'PACT-TEST1',
      version: '1.0',
      sequenceIndex: 0,
      action: 'CONTRACT_CREATED',
      actor: { role: 'creator', email: 'sofia@uxstudio.mx' },
      metadata: { ipAddress: '127.0.0.1', userAgent: 'TestRunner', timestamp: nowIso },
      documentHashAtEvent: docHash,
      previousEventHash: 'GENESIS_BLOCK',
      currentEventHash: event0Hash
    };

    // Alteración intencional de datos en event0
    const tamperedEvent0 = {
      ...event0,
      actor: { role: 'creator' as const, email: 'hacker@evil.com' }
    };

    const trail = [tamperedEvent0];
    const result = verifyAuditChainIntegrity(trail);
    expect(result.valid).toBe(false);
  });
});

describe('7. Zustand Store y Live Preview (< 16ms)', () => {
  it('actualiza el estado de forma atómica y recompila el preview sin latencia', () => {
    const store = useContractStore.getState();

    const start = performance.now();
    store.updateScope({ projectTitle: 'Nuevo Proyecto de Inteligencia Artificial' });
    const duration = performance.now() - start;

    // El tiempo de mutación y compilación reactiva debe ser inferior a 16.6ms (60 fps budget)
    expect(duration).toBeLessThan(16.6);

    const updated = useContractStore.getState();
    expect(updated.scope.projectTitle).toBe('Nuevo Proyecto de Inteligencia Artificial');
    expect(updated.cachedCanonicalMarkdown).toContain('Nuevo Proyecto de Inteligencia Artificial');
    expect(updated.cachedHumanMarkdown).toContain('Nuevo Proyecto de Inteligencia Artificial');
  });
});
