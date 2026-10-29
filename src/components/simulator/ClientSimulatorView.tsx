import React from 'react';
import { Sliders, FileSignature, CheckCircle2, Lock } from 'lucide-react';
import { ThemeStyles } from '../../types/theme';

interface ClientSimulatorViewProps {
  contractCode: string;
  scopeTitle: string;
  creatorLegalName: string;
  creatorCommercialName?: string;
  clientLegalName: string;
  totalAmountCents: number;
  currency: string;
  currencySymbol: string;
  milestonesCount: number;
  includedRevisionRounds: number;
  onOpenNegotiationDrawer: () => void;
  onOpenSignatureModal: () => void;
  styles: ThemeStyles;
}

export const ClientSimulatorView: React.FC<ClientSimulatorViewProps> = ({
  contractCode,
  scopeTitle,
  creatorLegalName,
  creatorCommercialName,
  clientLegalName,
  totalAmountCents,
  currency,
  currencySymbol,
  milestonesCount,
  includedRevisionRounds,
  onOpenNegotiationDrawer,
  onOpenSignatureModal,
  styles
}) => {
  return (
    <section className="flex-1 p-6 lg:p-10 flex flex-col items-center space-y-6 animate-fadeIn">
      {/* Top Banner explaining this view */}
      <div className="w-full max-w-[800px] p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-amber-500 font-bold">
          <Sliders className="w-4 h-4" />
          <span>Modo Vista del Cliente Receptor (Simulador de Negociación Asíncrona)</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenNegotiationDrawer}
            className="px-3 py-1.5 rounded-lg border border-amber-500/40 text-amber-500 hover:bg-amber-500/10 font-semibold transition-all flex items-center gap-1 cursor-pointer"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Solicitar Ajuste / Negociar</span>
          </button>

          <button
            onClick={onOpenSignatureModal}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <FileSignature className="w-3.5 h-3.5" />
            <span>Aprobar y Firmar</span>
          </button>
        </div>
      </div>

      {/* The Client Sheet */}
      <div className={`w-full max-w-[800px] p-8 lg:p-12 rounded-2xl transition-all duration-300 print-document ${styles.paperClasses}`}>
        {/* Document Header */}
        <div className="border-b border-slate-200 pb-6 mb-6 flex items-start justify-between">
          <div>
            <span className="text-[11px] font-mono tracking-widest text-slate-500 uppercase block mb-1">
              PROPUESTA DE ACUERDO BILATERAL · ID: {contractCode}
            </span>
            <h1 className="text-xl lg:text-2xl font-serif font-bold tracking-tight text-slate-900">
              {scopeTitle || 'Servicios Profesionales de Diseño y Desarrollo'}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Remitido por {creatorLegalName} {creatorCommercialName ? `(${creatorCommercialName})` : ''} para {clientLegalName || 'El Cliente'}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 shadow-sm shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        {/* Client View Body */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-bold text-blue-600 uppercase font-mono tracking-wider">Inversión Total</span>
              <h4 className="text-lg font-bold text-slate-900 mt-1 font-mono">
                {currencySymbol}{(totalAmountCents / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })} {currency}
              </h4>
              <p className="text-xs text-slate-600 mt-1">
                Dividido en {milestonesCount} hito(s) de pago con entregables vinculados.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-bold text-emerald-600 uppercase font-mono tracking-wider">Garantía de Entrega</span>
              <h4 className="text-base font-bold text-slate-900 mt-1">30 días naturales</h4>
              <p className="text-xs text-slate-600 mt-1">
                Incluye {includedRevisionRounds} rondas completas de ajustes sobre los entregables acordados.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 space-y-1">
            <div className="flex items-center gap-2 font-bold text-emerald-800">
              <Lock className="w-4 h-4" />
              <span>Certeza Jurídica para Ambas Partes (Art. 83 LFDA)</span>
            </div>
            <p className="leading-relaxed">
              Al firmar este acuerdo, el creador garantiza la entrega de los archivos finales y tú garantizas la titularidad patrimonial libre de gravamen una vez liquidado el finiquito.
            </p>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-200">
            <button
              onClick={onOpenNegotiationDrawer}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold transition-all cursor-pointer"
            >
              Proponer ajuste en días o entregables
            </button>
            <button
              onClick={onOpenSignatureModal}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
            >
              Firmar Acuerdo
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
