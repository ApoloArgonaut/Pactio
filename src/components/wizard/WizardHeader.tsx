import React from 'react';
import { ArrowLeft, ArrowRight, FileSignature, Check } from 'lucide-react';
import { ThemeStyles } from '../../types/theme';

interface WizardHeaderProps {
  currentStep: number;
  totalSteps?: number;
  onPrevStep: () => void;
  onNextStep: () => void;
  onProceedToSign: () => void;
  autosaveStatus: 'saved' | 'saving' | 'synced';
  styles: ThemeStyles;
}

const STEP_TITLES: Record<number, string> = {
  1: 'PARTES & IDENTIDAD FISCAL',
  2: 'ALCANCE & ENTREGABLES',
  3: 'PAGOS, HITOS & DIVISAS',
  4: 'PROPIEDAD INTELECTUAL & LFDA',
  5: 'GOBERNANZA & SALIDA LIMPIA'
};

export const WizardHeader: React.FC<WizardHeaderProps> = ({
  currentStep,
  totalSteps = 5,
  onPrevStep,
  onNextStep,
  onProceedToSign,
  autosaveStatus,
  styles
}) => {
  const progressPercent = Math.round((currentStep / totalSteps) * 100);

  return (
    <div className="space-y-4">
      {/* Top Meta: Step Counter & Autosave Indicator */}
      <div className="flex items-center justify-between text-xs font-mono">
        <span className="font-bold text-blue-500 tracking-wider">
          PASO {currentStep} DE {totalSteps} · {STEP_TITLES[currentStep] || ''}
        </span>
        <div className="flex items-center gap-1.5 opacity-70">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-[11px] text-slate-400">
            {autosaveStatus === 'saving' ? 'Guardando...' : 'Guardado automático'}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 transition-all duration-300 rounded-full"
          style={{ width: `${progressPercent}%` }}
        ></div>
      </div>

      {/* Quick Step Jump Tabs */}
      <div className="grid grid-cols-5 gap-1 pt-1">
        {[1, 2, 3, 4, 5].map((s) => (
          <div
            key={s}
            className={`h-1 rounded-full transition-colors ${
              s <= currentStep ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-800'
            }`}
          />
        ))}
      </div>
    </div>
  );
};
