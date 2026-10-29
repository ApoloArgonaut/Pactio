import React from 'react';
import { User, Users, HelpCircle, ShieldCheck } from 'lucide-react';
import { ThemeStyles } from '../../types/theme';
import { Party } from '../../core/schemas/party';

interface Step1PartiesProps {
  creator: Party;
  client: Party;
  onUpdateCreator: (patch: Partial<Party>) => void;
  onUpdateClient: (patch: Partial<Party>) => void;
  activeTooltip: string | null;
  onToggleTooltip: (name: string) => void;
  styles: ThemeStyles;
}

export const Step1Parties: React.FC<Step1PartiesProps> = ({
  creator,
  client,
  onUpdateCreator,
  onUpdateClient,
  activeTooltip,
  onToggleTooltip,
  styles
}) => {
  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Step Header */}
      <div>
        <h2 className="text-xl font-bold flex items-center gap-2">
          <span>Partes Contratantes e Identidad Legal</span>
          <button
            onClick={() => onToggleTooltip('parties')}
            className="opacity-60 hover:opacity-100 hover:text-blue-500 transition-opacity cursor-pointer"
            title="Ayuda didáctica sobre identidad fiscal"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </h2>
        {activeTooltip === 'parties' && (
          <div className={`p-3 my-2 text-xs rounded-xl border ${styles.infoBoxClass}`}>
            <p className="font-semibold text-blue-500">💡 Blindaje de Materialidad Fiscal:</p>
            <p>
              Incluir RFC con homoclave y razón social fidedigna vincula la factura CFDI emitida con el contrato firmado bajo la NOM-151, blindando deducciones ante revisiones del SAT (Art. 69-B CFF).
            </p>
          </div>
        )}
      </div>

      <div className="space-y-6">
        {/* Creator Identity Card */}
        <div className={`p-5 rounded-2xl border ${styles.panelBg} space-y-4`}>
          <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2 font-bold text-sm text-blue-500">
              <User className="w-4 h-4" />
              <span>1. Datos del Prestador (Tú)</span>
            </div>
            {/* Persona Física vs Moral Toggle */}
            <div className={`flex items-center border rounded-lg p-0.5 text-[10px] ${styles.pillClass}`}>
              <button
                type="button"
                onClick={() => onUpdateCreator({ personType: 'physical' })}
                className={`px-2 py-0.5 rounded font-medium cursor-pointer ${
                  creator.personType === 'physical' ? 'bg-blue-600 text-white font-bold' : 'opacity-70'
                }`}
              >
                Física (RESICO)
              </button>
              <button
                type="button"
                onClick={() => onUpdateCreator({ personType: 'moral' })}
                className={`px-2 py-0.5 rounded font-medium cursor-pointer ${
                  creator.personType === 'moral' ? 'bg-blue-600 text-white font-bold' : 'opacity-70'
                }`}
              >
                Moral (S.A.S / S.A.)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={styles.labelClass}>Nombre legal o Razón Social</label>
              <input
                type="text"
                value={creator.legalName}
                onChange={(e) => onUpdateCreator({ legalName: e.target.value })}
                className={styles.inputClass}
                placeholder="Ej. Sofía Valenzuela Mendoza"
              />
            </div>
            <div>
              <label className={styles.labelClass}>Nombre Comercial o Estudio</label>
              <input
                type="text"
                value={creator.commercialName || ''}
                onChange={(e) => onUpdateCreator({ commercialName: e.target.value })}
                className={styles.inputClass}
                placeholder="Ej. Estudio Prisma UX"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={styles.labelClass}>RFC con Homoclave</label>
              <div className="relative">
                <input
                  type="text"
                  value={creator.rfc}
                  onChange={(e) => onUpdateCreator({ rfc: e.target.value.toUpperCase() })}
                  className={`${styles.inputClass} font-mono`}
                  placeholder="VAMS9005128D3"
                  maxLength={13}
                />
                <span className="absolute right-2.5 top-2.5 text-emerald-500 text-xs font-mono font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  SAT
                </span>
              </div>
            </div>
            <div>
              <label className={styles.labelClass}>Correo electrónico para firma</label>
              <input
                type="email"
                value={creator.email}
                onChange={(e) => onUpdateCreator({ email: e.target.value })}
                className={styles.inputClass}
                placeholder="sofia@prisma.mx"
              />
            </div>
          </div>
        </div>

        {/* Client Identity Card */}
        <div className={`p-5 rounded-2xl border ${styles.panelBg} space-y-4`}>
          <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2 font-bold text-sm text-indigo-500">
              <Users className="w-4 h-4" />
              <span>2. Datos del Cliente Receptor</span>
            </div>
            {/* Client Person Type Toggle */}
            <div className={`flex items-center border rounded-lg p-0.5 text-[10px] ${styles.pillClass}`}>
              <button
                type="button"
                onClick={() => onUpdateClient({ personType: 'moral' })}
                className={`px-2 py-0.5 rounded font-medium cursor-pointer ${
                  client.personType === 'moral' ? 'bg-indigo-600 text-white font-bold' : 'opacity-70'
                }`}
              >
                Moral (Empresa)
              </button>
              <button
                type="button"
                onClick={() => onUpdateClient({ personType: 'physical' })}
                className={`px-2 py-0.5 rounded font-medium cursor-pointer ${
                  client.personType === 'physical' ? 'bg-indigo-600 text-white font-bold' : 'opacity-70'
                }`}
              >
                Física
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={styles.labelClass}>Razón Social o Nombre del Cliente</label>
              <input
                type="text"
                value={client.legalName}
                onChange={(e) => onUpdateClient({ legalName: e.target.value })}
                className={styles.inputClass}
                placeholder="Ej. Innovaciones Digitales de México S.A.P.I. de C.V."
              />
            </div>
            <div>
              <label className={styles.labelClass}>RFC del Cliente</label>
              <input
                type="text"
                value={client.rfc}
                onChange={(e) => onUpdateClient({ rfc: e.target.value.toUpperCase() })}
                className={`${styles.inputClass} font-mono`}
                placeholder="IDN180620TX9"
                maxLength={13}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={styles.labelClass}>Correo del Representante / Aprobador</label>
              <input
                type="email"
                value={client.email}
                onChange={(e) => onUpdateClient({ email: e.target.value })}
                className={styles.inputClass}
                placeholder="finanzas@empresa.com"
              />
            </div>
            <div>
              <label className={styles.labelClass}>Teléfono de contacto</label>
              <input
                type="tel"
                value={client.phone || ''}
                onChange={(e) => onUpdateClient({ phone: e.target.value })}
                className={styles.inputClass}
                placeholder="+52 55 1234 5678"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
