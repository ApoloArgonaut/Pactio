import type { ContractData } from '../../src/core/schemas/contract.js';

export function createValidTestContract(overrides?: Partial<ContractData>): ContractData {
  const base: ContractData = {
    id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    contractCode: 'PACT-DEMO1',
    status: 'DRAFT',
    versionMajor: 1,
    versionMinor: 0,
    parties: {
      creator: {
        role: 'creator',
        personType: 'physical',
        legalName: 'Sofía Valenzuela Mendoza',
        commercialName: 'Estudio UX Creativo',
        rfc: 'VAMS9005128D3',
        taxRegime: '626 - Régimen Simplificado de Confianza (RESICO)',
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
      },
      client: {
        role: 'client',
        personType: 'moral',
        legalName: 'Innovaciones Digitales del Norte S.A. de C.V.',
        commercialName: 'NovaTech',
        rfc: 'IDN180620TX9',
        email: 'mario.contacto@novatech.mx',
        phone: '+528189876543',
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
      projectTitle: 'Rediseño de Experiencia de Usuario y UI para App Móvil',
      serviceCategory: 'ux_ui_design',
      description: 'Diseño integral de experiencia de usuario y flujos de navegación.',
      deliverablesSummary: ['Mapa de navegación', 'Design System Figma'],
      requiredClientInputs: ['Manual de identidad y assets de marca vectoriales'],
      outOfScope: ['Desarrollo de código frontend o backend'],
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
          title: 'Descubrimiento y Arquitectura',
          percentage: 50,
          amountCents: 1500000,
          deliverables: ['Benchmark competitivo', 'Mapa de arquitectura'],
          status: 'pending'
        },
        {
          id: 'm2',
          order: 2,
          title: 'UI Kit y Prototipo',
          percentage: 50,
          amountCents: 1500000,
          deliverables: ['Librería Figma', 'Prototipo navegable'],
          status: 'pending'
        }
      ],
      latePaymentInterestRateMonthly: 3.0,
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
    canonicalMarkdown: '',
    canonicalPlainText: '',
    documentHash: '0'.repeat(64),
    auditTrail: [],
    createdAt: '2026-10-29T00:00:00.000Z',
    updatedAt: '2026-10-29T00:00:00.000Z',
    deletedAt: null
  };

  return { ...base, ...overrides };
}
