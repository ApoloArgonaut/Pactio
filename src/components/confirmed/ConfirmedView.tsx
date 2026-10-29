import React from 'react';
import { CheckCircle2, Download, Printer, Shield, Share2, Plus, ArrowRight } from 'lucide-react';
import { ThemeStyles } from '../../types/theme';

interface ConfirmedViewProps {
  contractCode: string;
  cachedDocumentHash: string;
  onDownloadMarkdown: () => void;
  onPrint: () => void;
  onDownloadNOM151Receipt: () => void;
  copiedLink: boolean;
  onCopyLink: () => void;
  onResetContract: () => void;
  onGoToVault: () => void;
  styles: ThemeStyles;
}

export const ConfirmedView: React.FC<ConfirmedViewProps> = ({
  contractCode,
  cachedDocumentHash,
  onDownloadMarkdown,
  onPrint,
  onDownloadNOM151Receipt,
  copiedLink,
  onCopyLink,
  onResetContract,
  onGoToVault,
  styles
}) => {
  return (
    <section className="flex-1 flex flex-col justify-center items-center p-6 lg:p-10 max-w-3xl mx-auto w-full space-y-6 animate-fadeIn">
      {/* Icon & Heading */}
      <div className="w-16 h-16 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center border border-emerald-500/30 shadow-lg shadow-emerald-500/20">
        <CheckCircle2 className="w-10 h-10" />
      </div>

      <div className="text-center space-y-2">
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          ¡Contrato Formalizado con Éxito Jurídico!
        </h2>
        <p className="text-xs sm:text-sm opacity-80 max-w-lg mx-auto leading-relaxed">
          Tu acuerdo cuenta con <strong>presunción de integridad y fecha cierta</strong> vinculante ante el SAT y juzgados mercantiles conforme a la NOM-151-SCFI-2016.
        </p>
      </div>

      {/* Official Audit Capsule */}
      <div className={`w-full p-6 rounded-2xl border ${styles.panelBg} space-y-4 text-xs`}>
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <span className="font-bold text-blue-500 font-mono">FOLIO OFICIAL: {contractCode}</span>
          <span className="font-mono text-[11px] opacity-75">Sello PSC Activo</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] font-mono">
          <div>
            <span className="opacity-60 block">Hash Criptográfico SHA-256:</span>
            <span className="font-bold text-blue-500 break-all">{cachedDocumentHash}</span>
          </div>
          <div>
            <span className="opacity-60 block">Estampa Temporal CENAM:</span>
            <span className="font-bold opacity-90">{new Date().toISOString()} (UTC)</span>
          </div>
        </div>
      </div>

      {/* Download & Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
        <button
          onClick={onDownloadMarkdown}
          className="py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.02] cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Descargar Contrato (.MD)</span>
        </button>

        <button
          onClick={onPrint}
          className={`py-3 px-4 rounded-xl border ${styles.pillClass} font-bold text-xs flex items-center justify-center gap-2 transition-all hover:scale-[1.02] cursor-pointer`}
        >
          <Printer className="w-4 h-4" />
          <span>Imprimir / Guardar como PDF</span>
        </button>

        <button
          onClick={onDownloadNOM151Receipt}
          className={`py-3 px-4 rounded-xl border ${styles.pillClass} font-bold text-xs flex items-center justify-center gap-2 transition-all hover:scale-[1.02] cursor-pointer`}
        >
          <Shield className="w-4 h-4 text-emerald-500" />
          <span>Descargar Constancia NOM-151 (.JSON)</span>
        </button>

        <button
          onClick={onCopyLink}
          className={`py-3 px-4 rounded-xl border ${styles.pillClass} font-bold text-xs flex items-center justify-center gap-2 transition-all hover:scale-[1.02] cursor-pointer`}
        >
          <Share2 className="w-4 h-4 text-amber-500" />
          <span>{copiedLink ? '¡Enlace Copiado al Portapapeles!' : 'Copiar Enlace para el Cliente'}</span>
        </button>
      </div>

      {/* Navigation Footer */}
      <div className="pt-2 flex items-center gap-4 text-xs font-bold">
        <button
          onClick={onResetContract}
          className="text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Crear Otro Contrato</span>
        </button>
        <span className="opacity-30">|</span>
        <button
          onClick={onGoToVault}
          className="text-blue-500 hover:underline flex items-center gap-1 cursor-pointer"
        >
          <span>Ir a la Bóveda de Contratos</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </section>
  );
};
