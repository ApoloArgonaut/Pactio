import React from 'react';
import { Lock, FileKey, Award, Check, HelpCircle } from 'lucide-react';
import { ThemeMode, ThemeStyles } from '../../types/theme';
import { IntellectualProperty } from '../../core/schemas/intellectual-property';

interface Step4IPProps {
  intellectualProperty: IntellectualProperty;
  onUpdateIP: (patch: Partial<IntellectualProperty>) => void;
  activeTooltip: string | null;
  onToggleTooltip: (name: string) => void;
  theme: ThemeMode;
  styles: ThemeStyles;
}

export const Step4IP: React.FC<Step4IPProps> = ({
  intellectualProperty,
  onUpdateIP,
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
          <span>Propiedad Intelectual, Derechos & Confidencialidad</span>
          <button
            onClick={() => onToggleTooltip('ip')}
            className="opacity-60 hover:opacity-100 hover:text-blue-500 transition-opacity cursor-pointer"
            title="Ayuda didáctica sobre LFDA"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </h2>
        {activeTooltip === 'ip' && (
          <div className={`p-3 my-2 text-xs rounded-xl border ${styles.infoBoxClass}`}>
            <p className="font-semibold text-blue-500">💡 Artículo 83 de la LFDA:</p>
            <p>
              En obras por encargo, los derechos patrimoniales pertenecen al creador hasta que se pague el 100%. Pactio hace que este candado sea inamovible para protegerte de clientes que reciben el trabajo y no pagan el finiquito.
            </p>
          </div>
        )}
      </div>

      <div className="space-y-3">
        {/* 1. Golden Lock: Reserva de Dominio (Pago 100%) */}
        <div className={styles.ipBannerClass}>
          <div className="flex items-center gap-2 font-bold text-sm mb-2 text-emerald-400">
            <Lock className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className={theme === 'warm' ? 'text-emerald-900 font-extrabold' : 'text-emerald-300 font-bold'}>
              1. Reserva de Dominio Definitiva (Pago 100% Obligatorio)
            </span>
          </div>
          <p className={`text-xs leading-relaxed ${theme === 'warm' ? 'text-stone-800' : 'text-slate-200'}`}>
            Conforme al <strong>Artículo 83 de la Ley Federal del Derecho de Autor (LFDA)</strong>, la cesión de derechos patrimoniales sobre los diseños, código y entregables opera <strong>única y exclusivamente sujeta a la condición suspensiva de liquidación del 100%</strong> de la contraprestación pactada.
          </p>
          <div className={`mt-3 flex items-center gap-2 text-[11px] font-bold ${theme === 'warm' ? 'text-emerald-800' : 'text-emerald-400'}`}>
            <Check className="w-4 h-4 shrink-0" />
            <span>Cláusula blindada activada por defecto en el contrato</span>
          </div>
        </div>

        {/* 2. Retention of Creator's Background IP / Know-how */}
        <div className={`p-4 rounded-xl border flex items-center justify-between ${styles.pillClass} hover:border-blue-400 transition-all`}>
          <div className="space-y-0.5 max-w-md">
            <div className="flex items-center gap-1.5 font-bold text-xs">
              <FileKey className="w-4 h-4 text-blue-500 shrink-0" />
              <span>2. Retención de Background IP y Librerías Previas</span>
            </div>
            <p className="text-[11px] opacity-80">
              El creador retiene la titularidad sobre sus plantillas previas, frameworks base, fuentes y herramientas metodológicas. Solo se transfieren los entregables finales específicos.
            </p>
          </div>
          <input
            type="checkbox"
            checked={intellectualProperty.retainCreatorBackgroundIP}
            onChange={(e) => onUpdateIP({ retainCreatorBackgroundIP: e.target.checked })}
            className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500 cursor-pointer shrink-0 ml-3"
          />
        </div>

        {/* 3. Moral Rights (Art. 21 LFDA) */}
        <div className={`p-4 rounded-xl border ${styles.pillClass} space-y-1`}>
          <div className="flex items-center gap-1.5 font-bold text-xs text-indigo-400">
            <Award className="w-4 h-4 shrink-0" />
            <span>3. Derechos Morales Irrenunciables (Crédito de Autoría)</span>
          </div>
          <p className="text-[11px] opacity-80 leading-relaxed">
            El Artículo 21 de la LFDA establece que el derecho a ser reconocido como autor original es inalienable, perpetuo e irrenunciable. El cliente no puede adjudicarse la autoría intelectual original.
          </p>
        </div>

        {/* 4. Portfolio Showcase Rights */}
        <div className={`p-4 rounded-xl border flex items-center justify-between ${styles.pillClass} hover:border-blue-400 transition-all`}>
          <div className="space-y-0.5 max-w-md">
            <h4 className="text-xs font-bold">4. Derecho de Exhibición en Portafolio</h4>
            <p className="text-[11px] opacity-80">
              Te autoriza a mostrar el caso de estudio y capturas en tu sitio web, Behance, LinkedIn y presentaciones comerciales tras el lanzamiento público.
            </p>
          </div>
          <input
            type="checkbox"
            checked={intellectualProperty.creatorPortfolioRights}
            onChange={(e) => onUpdateIP({ creatorPortfolioRights: e.target.checked })}
            className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500 cursor-pointer shrink-0 ml-3"
          />
        </div>

        {/* 5. NDA / Confidentiality Agreement */}
        <div className={`p-4 rounded-xl border ${styles.pillClass} space-y-3`}>
          <div className="flex items-center justify-between gap-3">
            <div>
              <h4 className="text-xs font-bold">5. Acuerdo Bilateral de Confidencialidad (NDA)</h4>
              <p className="text-[11px] opacity-80">Protección de secretos comerciales e información sensible compartida.</p>
            </div>
            <select
              value={intellectualProperty.confidentialityDurationYears}
              onChange={(e) => onUpdateIP({ confidentialityDurationYears: parseInt(e.target.value) })}
              className={styles.inlineSelectClass}
              style={{ colorScheme: theme === 'warm' ? 'light' : 'dark' }}
            >
              <option value={1} className={styles.optionClass} style={{ backgroundColor: theme === 'warm' ? '#ffffff' : '#0B1120', color: theme === 'warm' ? '#1C1917' : '#F8FAFC' }}>
                Vigencia: 1 año
              </option>
              <option value={2} className={styles.optionClass} style={{ backgroundColor: theme === 'warm' ? '#ffffff' : '#0B1120', color: theme === 'warm' ? '#1C1917' : '#F8FAFC' }}>
                Vigencia: 2 años
              </option>
              <option value={3} className={styles.optionClass} style={{ backgroundColor: theme === 'warm' ? '#ffffff' : '#0B1120', color: theme === 'warm' ? '#1C1917' : '#F8FAFC' }}>
                Vigencia: 3 años (Estándar)
              </option>
              <option value={5} className={styles.optionClass} style={{ backgroundColor: theme === 'warm' ? '#ffffff' : '#0B1120', color: theme === 'warm' ? '#1C1917' : '#F8FAFC' }}>
                Vigencia: 5 años
              </option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};
