import React from 'react';
import { DollarSign, HelpCircle, Plus, Trash2, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';
import { ThemeMode, ThemeStyles } from '../../types/theme';
import { Milestone } from '../../core/schemas/milestone';

interface Step3PaymentsProps {
  totalAmountCents: number;
  currency: 'MXN' | 'USD' | 'EUR';
  currencySymbol: string;
  milestones: Milestone[];
  onUpdatePayments: (patch: { currency?: 'MXN' | 'USD' | 'EUR'; totalAmountCents?: number }) => void;
  onApplyPaymentPreset: (preset: 'fixed_50_50' | 'milestones_30_40_30' | 'full_upfront') => void;
  onUpdateMilestone: (id: string, patch: Partial<Milestone>) => void;
  onAddMilestone: () => void;
  onDeleteMilestone: (id: string) => void;
  onAutoBalanceMilestones: () => void;
  activeTooltip: string | null;
  onToggleTooltip: (name: string) => void;
  theme: ThemeMode;
  styles: ThemeStyles;
}

export const Step3Payments: React.FC<Step3PaymentsProps> = ({
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
  activeTooltip,
  onToggleTooltip,
  theme,
  styles
}) => {
  const milestonesPercentSum = milestones.reduce((acc, m) => acc + m.percentage, 0);
  const isPercentBalanced = Math.abs(milestonesPercentSum - 100) < 0.1;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold flex items-center gap-2">
          <span>Estructura de Retribución y Esquema de Pagos</span>
          <button
            onClick={() => onToggleTooltip('payments')}
            className="opacity-60 hover:opacity-100 hover:text-blue-500 transition-opacity cursor-pointer"
            title="Ayuda didáctica sobre pagos e hitos"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </h2>
        {activeTooltip === 'payments' && (
          <div className={`p-3 my-2 text-xs rounded-xl border ${styles.infoBoxClass}`}>
            <p className="font-semibold text-blue-500">💡 Regla de Oro del Anticipo:</p>
            <p>
              Nunca inicies labores sin al menos un 50% de anticipo. El anticipo no es un depósito reembolsable; remunera el bloqueo de tu agenda y los costos iniciales de investigación y diseño.
            </p>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {/* Total Amount & Currency Selection */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={styles.labelClass}>Precio Total del Proyecto</label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-slate-400 font-bold">{currencySymbol}</span>
              <input
                type="number"
                min={0}
                step={500}
                value={totalAmountCents / 100}
                onChange={(e) => {
                  const val = Math.max(0, parseFloat(e.target.value) || 0) * 100;
                  onUpdatePayments({ totalAmountCents: Math.round(val) });
                }}
                className={`${styles.inputClass} pl-8 font-mono font-bold text-base`}
              />
            </div>
          </div>

          <div>
            <label className={styles.labelClass}>Moneda contractual</label>
            <select
              value={currency}
              onChange={(e) => onUpdatePayments({ currency: e.target.value as 'MXN' | 'USD' | 'EUR' })}
              className={styles.selectClass}
              style={{ colorScheme: theme === 'warm' ? 'light' : 'dark' }}
            >
              <option value="MXN" className={styles.optionClass} style={{ backgroundColor: theme === 'warm' ? '#ffffff' : '#0B1120', color: theme === 'warm' ? '#1C1917' : '#F8FAFC' }}>
                MXN ($ Pesos Mexicanos)
              </option>
              <option value="USD" className={styles.optionClass} style={{ backgroundColor: theme === 'warm' ? '#ffffff' : '#0B1120', color: theme === 'warm' ? '#1C1917' : '#F8FAFC' }}>
                USD ($ Dólares Americanos)
              </option>
              <option value="EUR" className={styles.optionClass} style={{ backgroundColor: theme === 'warm' ? '#ffffff' : '#0B1120', color: theme === 'warm' ? '#1C1917' : '#F8FAFC' }}>
                EUR (€ Euros Unión Europea)
              </option>
            </select>
          </div>
        </div>

        {/* Payment Model Presets */}
        <div className="space-y-2">
          <label className={styles.labelClass}>Modelos de Distribución Pre-configurados</label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
            <button
              type="button"
              onClick={() => onApplyPaymentPreset('fixed_50_50')}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                milestones.length === 2 && milestones[0].percentage === 50
                  ? 'bg-blue-600 text-white font-bold border-blue-500 shadow-sm'
                  : `${styles.pillClass} hover:border-blue-400`
              }`}
            >
              <span className="font-bold block">50 / 50 Estándar</span>
              <span className="text-[11px] opacity-75 block mt-0.5">50% Anticipo + 50% Finiquito</span>
            </button>

            <button
              type="button"
              onClick={() => onApplyPaymentPreset('milestones_30_40_30')}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                milestones.length === 3 && milestones[0].percentage === 30
                  ? 'bg-blue-600 text-white font-bold border-blue-500 shadow-sm'
                  : `${styles.pillClass} hover:border-blue-400`
              }`}
            >
              <span className="font-bold block">30 / 40 / 30 Hitos</span>
              <span className="text-[11px] opacity-75 block mt-0.5">Anticipo, Entrega Beta y Finiquito</span>
            </button>

            <button
              type="button"
              onClick={() => onApplyPaymentPreset('full_upfront')}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                milestones.length === 1 && milestones[0].percentage === 100
                  ? 'bg-blue-600 text-white font-bold border-blue-500 shadow-sm'
                  : `${styles.pillClass} hover:border-blue-400`
              }`}
            >
              <span className="font-bold block">100% Anticipo Express</span>
              <span className="text-[11px] opacity-75 block mt-0.5">Liquidación antes de comenzar</span>
            </button>
          </div>
        </div>

        {/* Visual Milestone Distribution Bar */}
        <div className="space-y-1.5 pt-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold">Distribución de Pagos & Anticipo</span>
            <span className={`font-mono font-bold ${isPercentBalanced ? 'text-emerald-500' : 'text-amber-500'}`}>
              {milestonesPercentSum}% {isPercentBalanced ? 'Balanceado' : 'Desbalanceado'} ({milestones.length} hitos)
            </span>
          </div>

          <div className="w-full h-3.5 bg-slate-200 dark:bg-slate-800 rounded-full flex overflow-hidden shadow-inner">
            {milestones.map((m, idx) => {
              const colors = ['bg-blue-600', 'bg-emerald-600', 'bg-indigo-600', 'bg-amber-600', 'bg-purple-600'];
              const colorClass = colors[idx % colors.length];
              return (
                <div
                  key={m.id}
                  style={{ width: `${m.percentage}%` }}
                  className={`${colorClass} flex items-center justify-center text-[10px] text-white font-bold font-mono transition-all duration-300 border-r border-white/20 last:border-none`}
                  title={`${m.title}: ${m.percentage}% (${currencySymbol}${(m.amountCents / 100).toLocaleString('en-US')})`}
                >
                  {m.percentage >= 15 ? `${m.percentage}%` : ''}
                </div>
              );
            })}
          </div>

          {!isPercentBalanced && (
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-500 text-xs flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>La suma de los porcentajes es {milestonesPercentSum}%. Debe sumar exactamente 100%.</span>
              </div>
              <button
                type="button"
                onClick={onAutoBalanceMilestones}
                className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-[11px] shrink-0 flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Auto-Equilibrar a 100%</span>
              </button>
            </div>
          )}
        </div>

        {/* Milestone Rows & Dynamic Management */}
        <div className="space-y-3 pt-2">
          {milestones.map((m, idx) => (
            <div
              key={m.id}
              className={`p-4 rounded-xl border ${styles.panelBg} space-y-3 hover:border-blue-400 transition-all`}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded">
                  Hito {idx + 1}
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold">
                    {currencySymbol}{(m.amountCents / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })} {currency}
                  </span>
                  {milestones.length > 1 && (
                    <button
                      type="button"
                      onClick={() => onDeleteMilestone(m.id)}
                      className="text-red-500 hover:text-red-400 p-1 rounded hover:bg-red-500/10 transition-colors cursor-pointer"
                      title="Eliminar este hito"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-[11px] opacity-75 block mb-1">Concepto del Hito</label>
                  <input
                    type="text"
                    value={m.title}
                    onChange={(e) => onUpdateMilestone(m.id, { title: e.target.value })}
                    className={styles.inputClass}
                    placeholder="Ej. Anticipo de inicio y research"
                  />
                </div>
                <div>
                  <label className="text-[11px] opacity-75 block mb-1">Porcentaje (%)</label>
                  <div className="relative">
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={m.percentage}
                      onChange={(e) => {
                        const p = Math.max(1, Math.min(100, parseInt(e.target.value) || 0));
                        const amt = Math.round((totalAmountCents * p) / 100);
                        onUpdateMilestone(m.id, { percentage: p, amountCents: amt });
                      }}
                      className={`${styles.inputClass} font-mono font-bold pr-7`}
                    />
                    <span className="absolute right-3 top-2.5 text-xs opacity-50 font-mono">%</span>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Add Milestone and Auto-Balance buttons */}
          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={onAddMilestone}
              className="flex items-center gap-1.5 text-xs text-blue-500 hover:text-blue-400 font-bold py-1 px-2 rounded-lg hover:bg-blue-500/10 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Agregar Hito Adicional</span>
            </button>

            {isPercentBalanced && (
              <span className="text-[11px] text-emerald-500 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>100% de retribución balanceada</span>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
