import React from 'react';
import { BookOpen, Search, ArrowRight, Download, Plus } from 'lucide-react';
import { ThemeStyles } from '../../types/theme';

interface VaultDashboardProps {
  contractCode: string;
  scopeTitle: string;
  clientLegalName: string;
  totalAmountCents: number;
  currency: string;
  currencySymbol: string;
  searchQuery: string;
  onChangeSearchQuery: (q: string) => void;
  onEditActiveContract: () => void;
  onDownloadMarkdown: () => void;
  styles: ThemeStyles;
}

export const VaultDashboard: React.FC<VaultDashboardProps> = ({
  contractCode,
  scopeTitle,
  clientLegalName,
  totalAmountCents,
  currency,
  currencySymbol,
  searchQuery,
  onChangeSearchQuery,
  onEditActiveContract,
  onDownloadMarkdown,
  styles
}) => {
  return (
    <section className="flex-1 p-6 lg:p-10 max-w-6xl mx-auto w-full space-y-8 animate-fadeIn">
      {/* Vault Header & Search */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-6 border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-blue-500" />
            <span>Bóveda de Contratos & Ciclo de Vida</span>
          </h2>
          <p className="text-xs opacity-75 mt-1">
            Repositorio inmutable de acuerdos pactados con certificación NOM-151 y trazabilidad fiscal.
          </p>
        </div>

        {/* Search Bar */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-3 opacity-40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onChangeSearchQuery(e.target.value)}
              placeholder="Buscar por cliente o ID..."
              className={`${styles.inputClass} pl-9 text-xs`}
            />
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className={`p-4 rounded-xl border ${styles.panelBg} space-y-1`}>
          <span className="text-[10px] uppercase font-mono tracking-wider opacity-60">Total Contratos</span>
          <p className="text-2xl font-bold font-mono">3</p>
          <span className="text-[10px] text-emerald-500 font-bold">1 Borrador · 1 Firmado · 1 Vencido</span>
        </div>
        <div className={`p-4 rounded-xl border ${styles.panelBg} space-y-1`}>
          <span className="text-[10px] uppercase font-mono tracking-wider opacity-60">Volumen Facturado</span>
          <p className="text-2xl font-bold font-mono">$95,000 MXN</p>
          <span className="text-[10px] opacity-75">100% cobrado bajo reserva LFDA</span>
        </div>
        <div className={`p-4 rounded-xl border ${styles.panelBg} space-y-1`}>
          <span className="text-[10px] uppercase font-mono tracking-wider opacity-60">Retención de Clientes</span>
          <p className="text-2xl font-bold font-mono">66.7%</p>
          <span className="text-[10px] text-blue-500 font-bold">2 clientes recurrentes</span>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Card 1: Current Active Contract */}
        <div className={`p-5 rounded-2xl border ${styles.panelBg} space-y-3 hover:border-blue-500 transition-all`}>
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-bold text-blue-500 bg-blue-500/10 px-2.5 py-1 rounded-lg border border-blue-500/20">
              {contractCode}
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              Borrador Activo
            </span>
          </div>

          <div>
            <h3 className="font-bold text-sm">{scopeTitle}</h3>
            <p className="text-xs opacity-75 mt-0.5">Cliente: {clientLegalName || 'Por definir'}</p>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800 text-xs">
            <span className="font-mono font-bold">
              {currencySymbol}{(totalAmountCents / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })} {currency}
            </span>
            <button
              onClick={onEditActiveContract}
              className="text-xs font-bold text-blue-500 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Editar</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Card 2: Sample NOM-151 Stamped Contract */}
        <div className={`p-5 rounded-2xl border ${styles.panelBg} space-y-3 opacity-90 hover:opacity-100 transition-all`}>
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-bold text-blue-500 bg-blue-500/10 px-2.5 py-1 rounded-lg border border-blue-500/20">
              PACT-9K4L1
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-500 border border-blue-500/20">
              Firmado NOM-151
            </span>
          </div>

          <div>
            <h3 className="font-bold text-sm">Consultoría UX & Auditoría de Checkout</h3>
            <p className="text-xs opacity-75 mt-0.5">Cliente: Finanzas Ágiles S.A.P.I.</p>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800 text-xs">
            <span className="font-mono font-bold">$65,000.00 MXN</span>
            <button
              onClick={onDownloadMarkdown}
              className="text-xs font-bold text-blue-500 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Descargar</span>
            </button>
          </div>
        </div>

        {/* Card 3: Expired / Renewal Ready Contract */}
        <div className={`p-5 rounded-2xl border ${styles.panelBg} space-y-3 opacity-80 hover:opacity-100 transition-all`}>
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-bold text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
              PACT-3M7N8
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20">
              Vigencia Concluida
            </span>
          </div>

          <div>
            <h3 className="font-bold text-sm">Mantenimiento de Design System Trimestre 1</h3>
            <p className="text-xs opacity-75 mt-0.5">Cliente: Logística Global Express</p>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800 text-xs">
            <span className="font-mono font-bold">$30,000.00 MXN</span>
            <span className="text-[11px] text-amber-500 font-semibold">Listo para Anexo/Renovación</span>
          </div>
        </div>
      </div>
    </section>
  );
};
