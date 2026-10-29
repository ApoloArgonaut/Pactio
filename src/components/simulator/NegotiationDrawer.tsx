import React from 'react';
import { Sliders, X, CheckCheck } from 'lucide-react';
import { ThemeStyles } from '../../types/theme';

interface NegotiationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  adjustedDays: number;
  onChangeAdjustedDays: (days: number) => void;
  hasAdjustmentProposal: boolean;
  onSendAdjustment: () => void;
  onAcceptAdjustment: () => void;
  styles: ThemeStyles;
}

export const NegotiationDrawer: React.FC<NegotiationDrawerProps> = ({
  isOpen,
  onClose,
  adjustedDays,
  onChangeAdjustedDays,
  hasAdjustmentProposal,
  onSendAdjustment,
  onAcceptAdjustment,
  styles
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs transition-opacity duration-300">
      <div className={`w-full max-w-md h-full ${styles.panelBg} border-l p-6 flex flex-col justify-between shadow-2xl overflow-y-auto animate-slideLeft`}>
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Sliders className="w-5 h-5 text-amber-500" />
              <h3 className="font-bold text-base">Negociación Bilateral de Términos</h3>
            </div>
            <button 
              onClick={onClose} 
              className="opacity-60 hover:opacity-100 p-1 cursor-pointer"
              title="Cerrar panel de negociación"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4 text-xs">
            <p className="opacity-80 leading-relaxed">
              El cliente puede proponer modificaciones puntuales a los términos sin romper el borrador ni recurrir a cadenas de emails caóticas.
            </p>

            {/* Adjustment Simulation: Tacit Approval Window */}
            <div className={`p-4 rounded-xl border ${styles.pillClass} space-y-3`}>
              <div className="flex items-center justify-between">
                <span className="font-bold">Ventana de Revisión de Entregables</span>
                <span className="font-mono text-amber-500 font-bold">{adjustedDays} días hábiles</span>
              </div>
              <input
                type="range"
                min={3}
                max={15}
                value={adjustedDays}
                onChange={(e) => onChangeAdjustedDays(parseInt(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] opacity-60 font-mono">
                <span>3 días (Rápido)</span>
                <span>5 días (Estándar)</span>
                <span>15 días (Corporativo)</span>
              </div>
            </div>

            {/* Redlining Visual Diff Preview */}
            {hasAdjustmentProposal && (
              <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 space-y-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-amber-500 font-bold block">
                  Propuesta en Cola (Diff Contractual v1.1)
                </span>
                <div className="space-y-1 font-mono text-xs">
                  <p className="text-red-500 bg-red-500/10 p-1 rounded line-through">
                    - Cláusula 4: Plazo de revisión de 5 días hábiles.
                  </p>
                  <p className="text-emerald-500 bg-emerald-500/10 p-1 rounded font-bold">
                    + Cláusula 4: Plazo de revisión de {adjustedDays} días hábiles.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Drawer Action Buttons */}
        <div className="space-y-2 pt-6 border-t border-slate-200 dark:border-slate-800">
          {!hasAdjustmentProposal ? (
            <button
              onClick={onSendAdjustment}
              className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-amber-600/20 transition-all cursor-pointer"
            >
              Simular Envío de Ajuste al Creador
            </button>
          ) : (
            <button
              onClick={onAcceptAdjustment}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <CheckCheck className="w-4 h-4" />
              <span>Creador Acepta Ajuste y Emite v1.1</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
