import React from 'react';
import { HelpCircle, Scale, ShieldAlert, Sliders } from 'lucide-react';
import { ThemeMode, ThemeStyles } from '../../types/theme';
import { Governance } from '../../core/schemas/governance';

interface Step5GovernanceProps {
  governance: Governance;
  onUpdateGovernance: (patch: Partial<Governance>) => void;
  activeTooltip: string | null;
  onToggleTooltip: (name: string) => void;
  theme: ThemeMode;
  styles: ThemeStyles;
}

export const Step5Governance: React.FC<Step5GovernanceProps> = ({
  governance,
  onUpdateGovernance,
  activeTooltip,
  onToggleTooltip,
  theme,
  styles
}) => {
  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold flex items-center gap-2">
          <span>Gobernanza y Reglas de Salida Limpia</span>
          <button
            onClick={() => onToggleTooltip('gov')}
            className="opacity-60 hover:opacity-100 hover:text-blue-500 transition-opacity cursor-pointer"
            title="Ayuda didáctica sobre gobernanza"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </h2>
        {activeTooltip === 'gov' && (
          <div className={`p-3 my-2 text-xs rounded-xl border ${styles.infoBoxClass}`}>
            <p className="font-semibold text-blue-500">💡 Silencio Tácito:</p>
            <p>
              El que calla otorga. Si el cliente no formula observaciones fundamentadas en los días hábiles acordados tras la entrega, el hito se tiene por aprobado tácitamente para liberar el pago.
            </p>
          </div>
        )}
      </div>

      <div className="space-y-3">
        {/* Revision rounds */}
        <div className={`p-4 rounded-xl border flex items-center justify-between ${styles.pillClass}`}>
          <div>
            <h4 className="text-xs font-bold">Rondas de Ajustes Incluidas</h4>
            <p className="text-[11px] opacity-75">Límite para evitar cambios infinitos y re-trabajo gratuito</p>
          </div>
          <select
            value={governance.includedRevisionRounds}
            onChange={(e) => onUpdateGovernance({ includedRevisionRounds: parseInt(e.target.value) })}
            className={styles.inlineSelectClass}
            style={{ colorScheme: theme === 'warm' ? 'light' : 'dark' }}
          >
            <option value={1} className={styles.optionClass} style={{ backgroundColor: theme === 'warm' ? '#ffffff' : '#0B1120', color: theme === 'warm' ? '#1C1917' : '#F8FAFC' }}>
              1 ronda de ajustes
            </option>
            <option value={2} className={styles.optionClass} style={{ backgroundColor: theme === 'warm' ? '#ffffff' : '#0B1120', color: theme === 'warm' ? '#1C1917' : '#F8FAFC' }}>
              2 rondas (Estándar)
            </option>
            <option value={3} className={styles.optionClass} style={{ backgroundColor: theme === 'warm' ? '#ffffff' : '#0B1120', color: theme === 'warm' ? '#1C1917' : '#F8FAFC' }}>
              3 rondas
            </option>
            <option value={4} className={styles.optionClass} style={{ backgroundColor: theme === 'warm' ? '#ffffff' : '#0B1120', color: theme === 'warm' ? '#1C1917' : '#F8FAFC' }}>
              4 rondas
            </option>
          </select>
        </div>

        {/* Tacit approval window */}
        <div className={`p-4 rounded-xl border flex items-center justify-between ${styles.pillClass}`}>
          <div>
            <h4 className="text-xs font-bold">Ventana de Aceptación Tácita</h4>
            <p className="text-[11px] opacity-75">Días hábiles para revisar antes de aprobación automática</p>
          </div>
          <select
            value={governance.tacitApprovalWindowDays}
            onChange={(e) => onUpdateGovernance({ tacitApprovalWindowDays: parseInt(e.target.value) })}
            className={styles.inlineSelectClass}
            style={{ colorScheme: theme === 'warm' ? 'light' : 'dark' }}
          >
            <option value={3} className={styles.optionClass} style={{ backgroundColor: theme === 'warm' ? '#ffffff' : '#0B1120', color: theme === 'warm' ? '#1C1917' : '#F8FAFC' }}>
              3 días hábiles
            </option>
            <option value={5} className={styles.optionClass} style={{ backgroundColor: theme === 'warm' ? '#ffffff' : '#0B1120', color: theme === 'warm' ? '#1C1917' : '#F8FAFC' }}>
              5 días hábiles (Recomendado)
            </option>
            <option value={7} className={styles.optionClass} style={{ backgroundColor: theme === 'warm' ? '#ffffff' : '#0B1120', color: theme === 'warm' ? '#1C1917' : '#F8FAFC' }}>
              7 días hábiles
            </option>
            <option value={10} className={styles.optionClass} style={{ backgroundColor: theme === 'warm' ? '#ffffff' : '#0B1120', color: theme === 'warm' ? '#1C1917' : '#F8FAFC' }}>
              10 días hábiles
            </option>
          </select>
        </div>

        {/* Kill Fee */}
        <div className={`p-4 rounded-xl border flex items-center justify-between ${styles.pillClass}`}>
          <div>
            <h4 className="text-xs font-bold">Salida Limpia (Kill Fee)</h4>
            <p className="text-[11px] opacity-75">Compensación justa si el cliente cancela unilateralmente</p>
          </div>
          <select
            value={governance.killFeePercentage}
            onChange={(e) => onUpdateGovernance({ killFeePercentage: parseInt(e.target.value) })}
            className={styles.inlineSelectClass}
            style={{ colorScheme: theme === 'warm' ? 'light' : 'dark' }}
          >
            <option value={30} className={styles.optionClass} style={{ backgroundColor: theme === 'warm' ? '#ffffff' : '#0B1120', color: theme === 'warm' ? '#1C1917' : '#F8FAFC' }}>
              30% retenido
            </option>
            <option value={50} className={styles.optionClass} style={{ backgroundColor: theme === 'warm' ? '#ffffff' : '#0B1120', color: theme === 'warm' ? '#1C1917' : '#F8FAFC' }}>
              50% retenido (Estándar)
            </option>
            <option value={70} className={styles.optionClass} style={{ backgroundColor: theme === 'warm' ? '#ffffff' : '#0B1120', color: theme === 'warm' ? '#1C1917' : '#F8FAFC' }}>
              70% retenido
            </option>
          </select>
        </div>

        {/* Dispute Resolution Method */}
        <div className={`p-4 rounded-xl border flex items-center justify-between ${styles.pillClass}`}>
          <div>
            <h4 className="text-xs font-bold">Resolución de Controversias</h4>
            <p className="text-[11px] opacity-75">Vía pactada para resolver cualquier diferendo legal</p>
          </div>
          <select
            value={governance.disputeResolutionMethod}
            onChange={(e) => onUpdateGovernance({ disputeResolutionMethod: e.target.value as any })}
            className={styles.inlineSelectClass}
            style={{ colorScheme: theme === 'warm' ? 'light' : 'dark' }}
          >
            <option value="amicable_negotiation" className={styles.optionClass} style={{ backgroundColor: theme === 'warm' ? '#ffffff' : '#0B1120', color: theme === 'warm' ? '#1C1917' : '#F8FAFC' }}>
              Negociación Amistosa Bilateral (30 días)
            </option>
            <option value="arbitration" className={styles.optionClass} style={{ backgroundColor: theme === 'warm' ? '#ffffff' : '#0B1120', color: theme === 'warm' ? '#1C1917' : '#F8FAFC' }}>
              Arbitraje Comercial Privado (CAM)
            </option>
            <option value="ordinary_courts" className={styles.optionClass} style={{ backgroundColor: theme === 'warm' ? '#ffffff' : '#0B1120', color: theme === 'warm' ? '#1C1917' : '#F8FAFC' }}>
              Tribunales Mercantiles Ordinarios
            </option>
          </select>
        </div>

        {/* Jurisdiction City & State Inputs */}
        <div className={`p-4 rounded-xl border ${styles.pillClass} space-y-3`}>
          <div>
            <h4 className="text-xs font-bold">Jurisdicción y Tribunales Competentes</h4>
            <p className="text-[11px] opacity-75">Ciudad y Estado sede para validez legal e interpretación</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] opacity-75 block mb-1">Ciudad</label>
              <input
                type="text"
                value={governance.jurisdiction?.city || ''}
                onChange={(e) => onUpdateGovernance({
                  jurisdiction: { ...(governance.jurisdiction || { city: 'Ciudad de México', state: 'CDMX' }), city: e.target.value }
                })}
                className={styles.inputClass}
                placeholder="Ej. Ciudad de México"
              />
            </div>
            <div>
              <label className="text-[10px] opacity-75 block mb-1">Estado / Región</label>
              <input
                type="text"
                value={governance.jurisdiction?.state || ''}
                onChange={(e) => onUpdateGovernance({
                  jurisdiction: { ...(governance.jurisdiction || { city: 'Ciudad de México', state: 'CDMX' }), state: e.target.value }
                })}
                className={styles.inputClass}
                placeholder="Ej. CDMX"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
