import React from 'react';
import { Printer, FileSignature, CheckCircle2, Search, Shield } from 'lucide-react';
import { ThemeMode, ThemeStyles } from '../../types/theme';
import { PreviewMode } from '../../core/store/contract-store';
import { CryptoAuditInspector } from './CryptoAuditInspector';

interface DocumentPreviewSheetProps {
  theme: ThemeMode;
  styles: ThemeStyles;
  previewMode: PreviewMode;
  contractCode: string;
  scopeTitle: string;
  creatorLegalName: string;
  creatorCommercialName?: string;
  clientLegalName: string;
  totalAmountCents: number;
  currency: string;
  currencySymbol: string;
  milestones: Array<{
    id: string;
    order: number;
    title: string;
    percentage: number;
    amountCents: number;
  }>;
  cachedDocumentHash: string;
  signatureDone: boolean;
  typedName: string;
  signatureType: 'touch' | 'type' | 'efirma';
  stampedSuccess: boolean;
  showAuditInspector: boolean;
  onToggleAuditInspector: () => void;
  onPrint: () => void;
  onProceedToSign: () => void;
  isCreatorView?: boolean;
}

export const DocumentPreviewSheet: React.FC<DocumentPreviewSheetProps> = ({
  theme,
  styles,
  previewMode,
  contractCode,
  scopeTitle,
  creatorLegalName,
  creatorCommercialName,
  clientLegalName,
  totalAmountCents,
  currency,
  currencySymbol,
  milestones,
  cachedDocumentHash,
  signatureDone,
  typedName,
  signatureType,
  stampedSuccess,
  showAuditInspector,
  onToggleAuditInspector,
  onPrint,
  onProceedToSign,
  isCreatorView = true
}) => {
  return (
    <div className={styles.previewBackdropClass}>
      {/* Quick Actions Bar above document */}
      <div className="w-full max-w-[760px] mb-3 flex items-center justify-between text-xs px-1">
        <span className="opacity-75 font-mono text-[11px]">
          {previewMode === 'human' ? 'Vista Humana Ciudadana' : 'Vista Jurídica Canónica'}
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={onPrint}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg border text-xs font-medium ${styles.pillClass} hover:opacity-100 transition-opacity cursor-pointer`}
            title="Imprimir documento oficial en hoja membretada A4/Carta"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimir / PDF</span>
          </button>
          {isCreatorView && (
            <button
              onClick={onProceedToSign}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
            >
              <FileSignature className="w-3.5 h-3.5" />
              <span>Firmar</span>
            </button>
          )}
        </div>
      </div>

      {/* The Physical Paper Document (A4 Bond Style) */}
      <div className={`w-full max-w-[760px] p-8 lg:p-12 rounded-2xl transition-all duration-300 print-document ${styles.paperClasses}`}>
        {/* Document Header */}
        <div className="border-b border-slate-200 pb-6 mb-8 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-mono tracking-widest text-slate-500 uppercase">
                INSTRUMENTO PRIVADO DIGITAL · ID: {contractCode}
              </span>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                NOM-151 COMPLIANT
              </span>
            </div>
            <h1 className="text-xl lg:text-2xl font-serif font-bold tracking-tight text-slate-900 leading-snug">
              {scopeTitle || 'Acuerdo de Prestación de Servicios Profesionales'}
            </h1>
            <p className="text-xs text-slate-500 mt-1 font-sans">
              Entre <strong>{creatorLegalName}</strong> {creatorCommercialName ? `(${creatorCommercialName})` : ''} y <strong>{clientLegalName || 'El Cliente'}</strong>
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 shadow-sm shrink-0">
            <CheckCircle2 className="w-7 h-7" />
          </div>
        </div>

        {/* Dynamic Payment & Deliverables Summary Box */}
        <div className="mb-8 p-5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3 font-sans">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-500 uppercase tracking-wider text-[10px]">Estructura de Retribución</span>
            <span className="font-bold text-slate-900 font-mono text-sm">
              {currencySymbol}{(totalAmountCents / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })} {currency}
            </span>
          </div>
          <div className="space-y-1.5">
            {milestones.map((m) => (
              <div key={m.id} className="flex items-center justify-between text-xs py-1 border-b border-slate-200/60 last:border-none">
                <span className="text-slate-700 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                  <span>{m.title}</span>
                  <span className="text-[10px] font-mono text-slate-400">({m.percentage}%)</span>
                </span>
                <span className="font-mono text-slate-900 font-semibold">
                  {currencySymbol}{(m.amountCents / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })} {currency}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Dynamic Dual-Content (Human Narrative vs Legal Clauses) */}
        <div className="space-y-6 text-sm font-sans leading-relaxed text-slate-800">
          {previewMode === 'human' ? (
            <div className="space-y-4 text-xs sm:text-sm">
              <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100 text-blue-900 space-y-1">
                <h4 className="font-bold text-xs uppercase tracking-wide flex items-center gap-1.5">
                  <span>🤝 En pocas palabras (Acuerdo Transparente)</span>
                </h4>
                <p className="text-xs leading-relaxed text-slate-700">
                  Este acuerdo define de forma honesta y recíproca lo que se va a realizar, los tiempos de entrega, las rondas de ajustes incluidas y la certeza de cobro.
                </p>
              </div>
              <p>
                <strong>1. Compromiso de Entrega:</strong> Los trabajos iniciarán a partir de la recepción de los accesos e insumos requeridos.
              </p>
              <p>
                <strong>2. Pagos y Anticipos:</strong> Los entregables finales se liberan con la liquidación total acordada.
              </p>
              <p>
                <strong>3. Protección de Derechos:</strong> La autoría moral siempre pertenece al creador y el cliente adquiere la explotación patrimonial plena al liquidar el 100%.
              </p>
            </div>
          ) : (
            <div className="space-y-4 text-xs font-serif leading-relaxed text-slate-900">
              <p>
                <strong>PRIMERA. OBJETO Y DELIMITACIÓN DE ALCANCE:</strong> El PRESTADOR se obliga a ejecutar en favor del CLIENTE los servicios profesionales consistentes en: <em>"{scopeTitle}"</em>.
              </p>
              <p>
                <strong>SEGUNDA. PRECIO Y CONTRAPRESTACIÓN:</strong> Por la prestación íntegra, el CLIENTE pagará la cantidad estipulada mediante la distribución en hitos convenida.
              </p>
              <p>
                <strong>TERCERA. RESERVA DE DOMINIO (LFDA ART. 83):</strong> La transmisión definitiva de derechos patrimoniales opera sujeta a la condición suspensiva de liquidación total del precio.
              </p>
              <p>
                <strong>CUARTA. REVISIÓN Y ACEPTACIÓN TÁCITA:</strong> El CLIENTE dispondrá de los días hábiles pactados tras cada entrega para formular observaciones justificadas; transcurrido el plazo sin pronunciamiento, operará la aprobación tácita.
              </p>
            </div>
          )}
        </div>

        {/* Signature Box Section */}
        <section className="mt-12 pt-8 border-t-2 border-dashed border-slate-200">
          <div className="text-[10px] font-mono uppercase tracking-widest text-slate-400 mb-6 text-center">
            Formalización Digital · Art. 89 Código de Comercio & NOM-151
          </div>
          <div className="grid grid-cols-2 gap-8 font-sans">
            <div className="border border-slate-200 rounded-xl p-4 text-center bg-slate-50/50">
              <span className="text-[10px] text-slate-400 block font-mono mb-2">Firma del Prestador</span>
              <div className="h-14 flex items-center justify-center border-b border-slate-300">
                {signatureDone || stampedSuccess ? (
                  signatureType === 'type' ? (
                    <span className="font-signature text-2xl text-blue-700 tracking-wide select-none">{typedName}</span>
                  ) : (
                    <span className="font-mono text-xs text-emerald-600 font-bold">✓ Firma Digital Verificada</span>
                  )
                ) : (
                  <span className="text-xs text-slate-300 italic">Pendiente de firma</span>
                )}
              </div>
              <p className="text-xs font-bold text-slate-800 mt-2">{creatorLegalName}</p>
              <span className="text-[10px] text-slate-400 font-mono">Prestador Independiente</span>
            </div>

            <div className="border border-slate-200 rounded-xl p-4 text-center bg-slate-50/50">
              <span className="text-[10px] text-slate-400 block font-mono mb-2">Firma del Cliente Receptor</span>
              <div className="h-14 flex items-center justify-center border-b border-slate-300">
                {stampedSuccess ? (
                  <span className="font-mono text-xs text-emerald-600 font-bold">✓ Ratificación Aceptada</span>
                ) : (
                  <span className="text-xs text-slate-300 italic">Recepción / Magic Link</span>
                )}
              </div>
              <p className="text-xs font-bold text-slate-800 mt-2">{clientLegalName || 'Por designar'}</p>
              <span className="text-[10px] text-slate-400 font-mono">Contraparte Receptora</span>
            </div>
          </div>
        </section>

        {/* Legal Stamp Footer */}
        <div className="pt-6 border-t border-slate-200 mt-8 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 font-sans relative">
          <div className="flex items-center gap-2">
            <span>
              Hash canónico:{' '}
              <code className="font-mono text-blue-600 bg-blue-50 px-1 py-0.5 rounded">
                {cachedDocumentHash.substring(0, 16)}...
              </code>
            </span>
            <button
              onClick={onToggleAuditInspector}
              className="text-[10px] text-blue-600 hover:underline flex items-center gap-0.5 font-bold cursor-pointer"
              title="Verificar huella SHA-256 e integridad"
            >
              <Search className="w-3 h-3" />
              <span>Inspeccionar</span>
            </button>
          </div>

          <span className="font-mono text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
            Certificación NOM-151 PSC
          </span>

          {/* Cryptographic Inspector Popover */}
          {showAuditInspector && (
            <CryptoAuditInspector
              documentHash={cachedDocumentHash}
              onClose={onToggleAuditInspector}
            />
          )}
        </div>
      </div>
    </div>
  );
};
