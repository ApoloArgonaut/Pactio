import React from 'react';
import { ArrowLeft, ArrowRight, FileSignature } from 'lucide-react';
import { ThemeMode, ThemeStyles } from '../../types/theme';
import { WizardHeader } from './WizardHeader';
import { Step1Parties } from './Step1Parties';
import { Step2Scope } from './Step2Scope';
import { Step3Payments } from './Step3Payments';
import { Step4IP } from './Step4IP';
import { Step5Governance } from './Step5Governance';
import { Party } from '../../core/schemas/party';
import { Scope } from '../../core/schemas/scope';
import { Milestone } from '../../core/schemas/milestone';
import { IntellectualProperty } from '../../core/schemas/intellectual-property';
import { Governance } from '../../core/schemas/governance';

import { AutosaveStatus, PaymentPreset } from '../../core/store/contract-store';

interface WizardStepContainerProps {
  currentStep: number;
  onPrevStep: () => void;
  onNextStep: () => void;
  onProceedToSign: () => void;
  autosaveStatus: AutosaveStatus;
  // State slices
  creator: Party;
  client: Party;
  onUpdateCreator: (patch: Partial<Party>) => void;
  onUpdateClient: (patch: Partial<Party>) => void;
  scope: Scope;
  onUpdateScope: (patch: Partial<Scope>) => void;
  totalAmountCents: number;
  currency: 'MXN' | 'USD' | 'EUR';
  currencySymbol: string;
  milestones: Milestone[];
  onUpdatePayments: (patch: { currency?: 'MXN' | 'USD' | 'EUR'; totalAmountCents?: number }) => void;
  onApplyPaymentPreset: (preset: PaymentPreset) => void;
  onUpdateMilestone: (id: string, patch: Partial<Milestone>) => void;
  onAddMilestone: () => void;
  onDeleteMilestone: (id: string) => void;
  onAutoBalanceMilestones: () => void;
  intellectualProperty: IntellectualProperty;
  onUpdateIP: (patch: Partial<IntellectualProperty>) => void;
  governance: Governance;
  onUpdateGovernance: (patch: Partial<Governance>) => void;
  activeTooltip: string | null;
  onToggleTooltip: (name: string) => void;
  theme: ThemeMode;
  styles: ThemeStyles;
}

export const WizardStepContainer: React.FC<WizardStepContainerProps> = ({
  currentStep,
  onPrevStep,
  onNextStep,
  onProceedToSign,
  autosaveStatus,
  creator,
  client,
  onUpdateCreator,
  onUpdateClient,
  scope,
  onUpdateScope,
  totalAmountCents,
  currency,
  currencySymbol,
  milestones,
  onUpdatePayments,
  onApplyPaymentPreset,
  onUpdateMilestone,
  onAddMilestone,
  onDeleteMilestone,
  onAutoBalanceMilestones,
  intellectualProperty,
  onUpdateIP,
  governance,
  onUpdateGovernance,
  activeTooltip,
  onToggleTooltip,
  theme,
  styles
}) => {
  return (
    <div className="w-full lg:w-[52%] p-6 lg:p-8 overflow-y-auto flex flex-col justify-between border-r border-slate-200 dark:border-slate-800">
      <div className="space-y-6 max-w-xl mx-auto w-full">
        {/* Wizard Header & Stepper */}
        <WizardHeader
          currentStep={currentStep}
          totalSteps={5}
          onPrevStep={onPrevStep}
          onNextStep={onNextStep}
          onProceedToSign={onProceedToSign}
          autosaveStatus={autosaveStatus}
          styles={styles}
        />

        {/* Step Views */}
        {currentStep === 1 && (
          <Step1Parties
            creator={creator}
            client={client}
            onUpdateCreator={onUpdateCreator}
            onUpdateClient={onUpdateClient}
            activeTooltip={activeTooltip}
            onToggleTooltip={onToggleTooltip}
            styles={styles}
          />
        )}

        {currentStep === 2 && (
          <Step2Scope
            scope={scope}
            onUpdateScope={onUpdateScope}
            activeTooltip={activeTooltip}
            onToggleTooltip={onToggleTooltip}
            styles={styles}
          />
        )}

        {currentStep === 3 && (
          <Step3Payments
            totalAmountCents={totalAmountCents}
            currency={currency}
            currencySymbol={currencySymbol}
            milestones={milestones}
            onUpdatePayments={onUpdatePayments}
            onApplyPaymentPreset={onApplyPaymentPreset}
            onUpdateMilestone={onUpdateMilestone}
            onAddMilestone={onAddMilestone}
            onDeleteMilestone={onDeleteMilestone}
            onAutoBalanceMilestones={onAutoBalanceMilestones}
            activeTooltip={activeTooltip}
            onToggleTooltip={onToggleTooltip}
            theme={theme}
            styles={styles}
          />
        )}

        {currentStep === 4 && (
          <Step4IP
            intellectualProperty={intellectualProperty}
            onUpdateIP={onUpdateIP}
            activeTooltip={activeTooltip}
            onToggleTooltip={onToggleTooltip}
            theme={theme}
            styles={styles}
          />
        )}

        {currentStep === 5 && (
          <Step5Governance
            governance={governance}
            onUpdateGovernance={onUpdateGovernance}
            activeTooltip={activeTooltip}
            onToggleTooltip={onToggleTooltip}
            theme={theme}
            styles={styles}
          />
        )}
      </div>

      {/* Navigation Controls Footer */}
      <div className="pt-8 border-t border-slate-200 dark:border-slate-800 max-w-xl mx-auto w-full flex items-center justify-between gap-4">
        {currentStep > 1 ? (
          <button
            type="button"
            onClick={onPrevStep}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl border text-xs font-semibold ${styles.pillClass} hover:opacity-100 transition-opacity cursor-pointer`}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Paso anterior</span>
          </button>
        ) : (
          <div></div>
        )}

        {currentStep < 5 ? (
          <button
            type="button"
            onClick={onNextStep}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/20 cursor-pointer"
          >
            <span>Siguiente paso</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={onProceedToSign}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white text-xs font-bold shadow-lg shadow-emerald-500/25 transition-all hover:scale-105 animate-pulse cursor-pointer"
          >
            <FileSignature className="w-4 h-4" />
            <span>Proceder a Firma & Timbrado</span>
          </button>
        )}
      </div>
    </div>
  );
};
