import React from 'react';
import { HelpCircle, Clock } from 'lucide-react';
import { ThemeStyles } from '../../types/theme';
import { Scope } from '../../core/schemas/scope';

interface Step2ScopeProps {
  scope: Scope;
  onUpdateScope: (patch: Partial<Scope>) => void;
  activeTooltip: string | null;
  onToggleTooltip: (name: string) => void;
  styles: ThemeStyles;
}

export const Step2Scope: React.FC<Step2ScopeProps> = ({
  scope,
  onUpdateScope,
  activeTooltip,
  onToggleTooltip,
  styles
}) => {
  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold flex items-center gap-2">
          <span>¿Qué vas a entregar exactamente?</span>
          <button
            onClick={() => onToggleTooltip('scope')}
            className="opacity-60 hover:opacity-100 hover:text-blue-500 transition-opacity cursor-pointer"
            title="Ayuda didáctica sobre delimitación de alcance"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </h2>
        {activeTooltip === 'scope' && (
          <div className={`p-3 my-2 text-xs rounded-xl border ${styles.infoBoxClass}`}>
            <p className="font-semibold text-blue-500">💡 Cómo blindar el Scope Creep:</p>
            <p>
              Delimitar claramente lo que incluye y lo que NO incluye protege tu tiempo y te da base legal para cobrar adicionales cuando el cliente solicita requerimientos fuera del acuerdo inicial.
            </p>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <label className={styles.labelClass}>Título del proyecto</label>
          <input
            type="text"
            value={scope.projectTitle}
            onChange={(e) => onUpdateScope({ projectTitle: e.target.value })}
            className={styles.inputClass}
            placeholder="Ej. Rediseño de Experiencia de Usuario y UI para App Móvil"
          />
        </div>

        <div>
          <label className={styles.labelClass}>Descripción del alcance detallado</label>
          <textarea
            rows={3}
            value={scope.description}
            onChange={(e) => onUpdateScope({ description: e.target.value })}
            className={styles.inputClass}
            placeholder="Describe las tareas, entregables clave y formato de entrega..."
          />
        </div>

        {/* Insumos Previos Callout (Blindaje de Tiempo) */}
        <div className={styles.infoBoxClass}>
          <div className="flex items-center gap-2 font-bold text-xs mb-1.5 text-blue-500">
            <Clock className="w-4 h-4" />
            <span>Condición de Insumos Previos (Blindaje de Tiempo)</span>
          </div>
          <p className="text-xs leading-relaxed opacity-85">
            "Los plazos de entrega pactados iniciarán su cómputo únicamente a partir de la fecha en que el Cliente proporcione la totalidad de los accesos, credenciales e insumos técnicos requeridos."
          </p>
        </div>
      </div>
    </div>
  );
};
