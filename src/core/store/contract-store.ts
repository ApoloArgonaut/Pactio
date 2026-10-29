import { create } from 'zustand';
import type { Party } from '../schemas/party.js';
import type { Milestone, PaymentPlan } from '../schemas/milestone.js';
import type { Scope } from '../schemas/scope.js';
import type { IntellectualProperty } from '../schemas/intellectual-property.js';
import type { Governance } from '../schemas/governance.js';
import type { ContractStatus, ContractData } from '../schemas/contract.js';
import {
  compileToCanonicalMarkdown,
  compileToHumanMarkdown,
  compileToCanonicalPlainText,
  generateDocumentHash
} from '../compiler/dual-compiler.js';

export type PreviewMode = 'human' | 'legal';
export type AutosaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export interface ContractStoreState {
  // Identificación y Estado
  id: string;
  contractCode: string;
  status: ContractStatus;
  versionMajor: number;
  versionMinor: number;
  previewMode: PreviewMode;
  autosaveStatus: AutosaveStatus;
  lastSavedAt: string | null;

  // Los 5 Módulos Canónicos
  parties: {
    creator: Party;
    client: Party;
  };
  scope: Scope;
  payments: PaymentPlan;
  intellectualProperty: IntellectualProperty;
  governance: Governance;

  // Caché compilada en memoria (< 16ms Live Preview)
  cachedCanonicalMarkdown: string;
  cachedHumanMarkdown: string;
  cachedDocumentHash: string;

  // Acciones de actualización modular y selectores
  setPreviewMode: (mode: PreviewMode) => void;
  updateCreator: (patch: Partial<Party>) => void;
  updateClient: (patch: Partial<Party>) => void;
  updateScope: (patch: Partial<Scope>) => void;
  updateMilestone: (id: string, patch: Partial<Milestone>) => void;
  addMilestone: (milestone: Milestone) => void;
  removeMilestone: (id: string) => void;
  updatePayments: (patch: Partial<PaymentPlan>) => void;
  updateIP: (patch: Partial<IntellectualProperty>) => void;
  updateGovernance: (patch: Partial<Governance>) => void;
  recompilePreview: () => void;
  setAutosaveStatus: (status: AutosaveStatus) => void;
  toContractData: () => ContractData;
}

const defaultCreator: Party = {
  role: 'creator',
  personType: 'physical',
  legalName: 'Sofía Valenzuela Mendoza',
  commercialName: 'Estudio UX Creativo',
  rfc: 'VAMS9005128D1',
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
};

const defaultClient: Party = {
  role: 'client',
  personType: 'moral',
  legalName: 'Innovaciones Digitales del Norte S.A. de C.V.',
  commercialName: 'NovaTech',
  rfc: 'IDN180620TX6',
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
};

const defaultScope: Scope = {
  projectTitle: 'Rediseño de Experiencia de Usuario y UI para App Móvil',
  serviceCategory: 'ux_ui_design',
  description: 'Diseño integral de experiencia de usuario, flujos de navegación, wireframes en alta fidelidad y prototipo interactivo en Figma para la aplicación móvil iOS y Android.',
  deliverablesSummary: [
    'Mapa de navegación y arquitectura de información',
    'Design System con tokens de diseño en Figma',
    'Flujos principales de onboarding y checkout interactivo'
  ],
  requiredClientInputs: [
    'Manual de identidad y assets de marca vectoriales',
    'Accesos a cuentas de analítica previas',
    'Validación de requerimientos técnicos con equipo de desarrollo'
  ],
  outOfScope: [
    'Desarrollo de código frontend o backend',
    'Compra de suscripciones tipográficas comerciales',
    'Creación de contenidos multimedia o redacción de copys'
  ],
  startDateTrigger: 'upon_inputs_received'
};

const defaultMilestones: Milestone[] = [
  {
    id: 'm1-discovery',
    order: 1,
    title: 'Descubrimiento y Arquitectura de Información',
    percentage: 50,
    amountCents: 1500000, // $15,000.00 MXN
    deliverables: ['Benchmark competitivo', 'User Personas', 'Mapa de arquitectura'],
    status: 'pending'
  },
  {
    id: 'm2-delivery',
    order: 2,
    title: 'UI Kit y Prototipo Final Interactivo',
    percentage: 50,
    amountCents: 1500000, // $15,000.00 MXN
    deliverables: ['Librería de componentes Figma', 'Prototipo navegable', 'Guía de handoff'],
    status: 'pending'
  }
];

const defaultPayments: PaymentPlan = {
  currency: 'MXN',
  totalAmountCents: 3000000, // $30,000.00 MXN
  model: 'fixed_50_50',
  milestones: defaultMilestones,
  latePaymentInterestRateMonthly: 3.0,
  gracePeriodDays: 5,
  suspensionThresholdDays: 5
};

const defaultIP: IntellectualProperty = {
  transferTiming: 'upon_final_payment',
  moralRightsRetention: true,
  creatorPortfolioRights: true,
  confidentialityDurationYears: 3,
  retainCreatorBackgroundIP: true,
  nonExclusiveServices: true
};

const defaultGovernance: Governance = {
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
};

export const useContractStore = create<ContractStoreState>((set, get) => {
  // Función auxiliar de compilación rápida sin saturar memoria
  const computeCompiledData = (state: Partial<ContractStoreState>) => {
    const fullMockData: ContractData = {
      id: state.id || 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
      contractCode: state.contractCode || 'PACT-DEMO1',
      status: state.status || 'DRAFT',
      versionMajor: state.versionMajor || 1,
      versionMinor: state.versionMinor || 0,
      parties: state.parties || { creator: defaultCreator, client: defaultClient },
      scope: state.scope || defaultScope,
      payments: state.payments || defaultPayments,
      intellectualProperty: state.intellectualProperty || defaultIP,
      governance: state.governance || defaultGovernance,
      adjustments: [],
      signatures: {},
      canonicalMarkdown: '',
      canonicalPlainText: '',
      documentHash: '0'.repeat(64),
      auditTrail: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deletedAt: null
    };

    const canonicalMd = compileToCanonicalMarkdown(fullMockData);
    const humanMd = compileToHumanMarkdown(fullMockData);
    const plainText = compileToCanonicalPlainText(fullMockData);
    const docHash = generateDocumentHash(plainText);

    return {
      cachedCanonicalMarkdown: canonicalMd,
      cachedHumanMarkdown: humanMd,
      cachedDocumentHash: docHash
    };
  };

  const initialCompiled = computeCompiledData({
    id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    contractCode: 'PACT-8X9K2',
    status: 'DRAFT',
    versionMajor: 1,
    versionMinor: 0,
    parties: { creator: defaultCreator, client: defaultClient },
    scope: defaultScope,
    payments: defaultPayments,
    intellectualProperty: defaultIP,
    governance: defaultGovernance
  });

  return {
    id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    contractCode: 'PACT-8X9K2',
    status: 'DRAFT',
    versionMajor: 1,
    versionMinor: 0,
    previewMode: 'human',
    autosaveStatus: 'idle',
    lastSavedAt: null,

    parties: { creator: defaultCreator, client: defaultClient },
    scope: defaultScope,
    payments: defaultPayments,
    intellectualProperty: defaultIP,
    governance: defaultGovernance,

    ...initialCompiled,

    setPreviewMode: (mode: PreviewMode) => set({ previewMode: mode }),

    updateCreator: (patch) => {
      set((state) => {
        const nextParties = {
          ...state.parties,
          creator: { ...state.parties.creator, ...patch }
        };
        const nextState = { ...state, parties: nextParties };
        return {
          parties: nextParties,
          ...computeCompiledData(nextState)
        };
      });
    },

    updateClient: (patch) => {
      set((state) => {
        const nextParties = {
          ...state.parties,
          client: { ...state.parties.client, ...patch }
        };
        const nextState = { ...state, parties: nextParties };
        return {
          parties: nextParties,
          ...computeCompiledData(nextState)
        };
      });
    },

    updateScope: (patch) => {
      set((state) => {
        const nextScope = { ...state.scope, ...patch };
        const nextState = { ...state, scope: nextScope };
        return {
          scope: nextScope,
          ...computeCompiledData(nextState)
        };
      });
    },

    updateMilestone: (id, patch) => {
      set((state) => {
        const nextMilestones = state.payments.milestones.map((m) =>
          m.id === id ? { ...m, ...patch } : m
        );
        const nextPayments = { ...state.payments, milestones: nextMilestones };
        const nextState = { ...state, payments: nextPayments };
        return {
          payments: nextPayments,
          ...computeCompiledData(nextState)
        };
      });
    },

    addMilestone: (milestone) => {
      set((state) => {
        const nextMilestones = [...state.payments.milestones, milestone];
        const nextPayments = { ...state.payments, milestones: nextMilestones };
        const nextState = { ...state, payments: nextPayments };
        return {
          payments: nextPayments,
          ...computeCompiledData(nextState)
        };
      });
    },

    removeMilestone: (id) => {
      set((state) => {
        const nextMilestones = state.payments.milestones.filter((m) => m.id !== id);
        const nextPayments = { ...state.payments, milestones: nextMilestones };
        const nextState = { ...state, payments: nextPayments };
        return {
          payments: nextPayments,
          ...computeCompiledData(nextState)
        };
      });
    },

    updatePayments: (patch) => {
      set((state) => {
        const nextPayments = { ...state.payments, ...patch };
        const nextState = { ...state, payments: nextPayments };
        return {
          payments: nextPayments,
          ...computeCompiledData(nextState)
        };
      });
    },

    updateIP: (patch) => {
      set((state) => {
        const nextIP = { ...state.intellectualProperty, ...patch };
        const nextState = { ...state, intellectualProperty: nextIP };
        return {
          intellectualProperty: nextIP,
          ...computeCompiledData(nextState)
        };
      });
    },

    updateGovernance: (patch) => {
      set((state) => {
        const nextGov = { ...state.governance, ...patch };
        const nextState = { ...state, governance: nextGov };
        return {
          governance: nextGov,
          ...computeCompiledData(nextState)
        };
      });
    },

    recompilePreview: () => {
      set((state) => ({ ...computeCompiledData(state) }));
    },

    setAutosaveStatus: (status) => set({ autosaveStatus: status }),

    toContractData: () => {
      const state = get();
      const plainText = compileToCanonicalPlainText({
        ...state,
        adjustments: [],
        signatures: {},
        canonicalMarkdown: '',
        canonicalPlainText: '',
        documentHash: '',
        auditTrail: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deletedAt: null
      });

      return {
        id: state.id,
        contractCode: state.contractCode,
        status: state.status,
        versionMajor: state.versionMajor,
        versionMinor: state.versionMinor,
        parties: state.parties,
        scope: state.scope,
        payments: state.payments,
        intellectualProperty: state.intellectualProperty,
        governance: state.governance,
        adjustments: [],
        signatures: {},
        canonicalMarkdown: state.cachedCanonicalMarkdown,
        canonicalPlainText: plainText,
        documentHash: state.cachedDocumentHash,
        auditTrail: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deletedAt: null
      };
    }
  };
});
