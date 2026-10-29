import React from 'react';
import { PenTool, Sliders, Shield, Lock, Award, CheckCircle2, ArrowRight } from 'lucide-react';
import { ThemeStyles } from '../../types/theme';

interface LandingViewProps {
  onStartDraft: () => void;
  onOpenClientSimulator: () => void;
  styles: ThemeStyles;
}

export const LandingView: React.FC<LandingViewProps> = ({
  onStartDraft,
  onOpenClientSimulator,
  styles
}) => {
  return (
    <section className="flex-1 flex flex-col justify-center items-center px-4 py-12 max-w-5xl mx-auto space-y-12 animate-fadeIn">
      {/* Hero Banner */}
      <div className="text-center space-y-5 max-w-3xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-500 text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping"></span>
          <span>LegalTech de Consenso Asíncrono para Creadores y Empresas</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
          Cierra Acuerdos en Minutos con{' '}
          <span className="bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-500 bg-clip-text text-transparent">
            Blindaje NOM-151
          </span>{' '}
          y Cero Cobros Fallidos
        </h1>

        <p className="text-sm sm:text-base opacity-80 leading-relaxed max-w-2xl mx-auto">
          Pactio transforma cotizaciones y mensajes informales en contratos legalmente vinculantes con reserva de dominio (Art. 83 LFDA), anticipos blindados y firma electrónica avanzada.
        </p>

        {/* Hero Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            onClick={onStartDraft}
            className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-blue-500/25 transition-all flex items-center gap-2 hover:scale-[1.02] cursor-pointer"
          >
            <PenTool className="w-4 h-4" />
            <span>Comenzar Nuevo Contrato Inteligente</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenClientSimulator}
            className={`px-5 py-3.5 rounded-xl border text-sm font-semibold transition-all flex items-center gap-2 ${styles.pillClass} hover:border-amber-500 hover:text-amber-500 cursor-pointer`}
          >
            <Sliders className="w-4 h-4 text-amber-500" />
            <span>Simular Experiencia del Cliente</span>
          </button>
        </div>
      </div>

      {/* 3 Core Value Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
        <div className={`p-6 rounded-2xl border ${styles.panelBg} space-y-3 hover:border-blue-500 transition-all`}>
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
            <Lock className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base">Blindaje de Scope y Anticipo</h3>
          <p className="text-xs opacity-75 leading-relaxed">
            Los entregables no inician hasta recibir insumos completos y anticipo mínimo del 50%. Erradica el retrabajo gratuito con rondas de ajustes limitadas.
          </p>
        </div>

        <div className={`p-6 rounded-2xl border ${styles.panelBg} space-y-3 hover:border-emerald-500 transition-all`}>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
            <Shield className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base">Reserva de Dominio (LFDA Art. 83)</h3>
          <p className="text-xs opacity-75 leading-relaxed">
            La titularidad patrimonial sobre diseños y código solo se transfiere cuando el cliente liquida el 100%. Sin finiquito, no hay cesión de derechos.
          </p>
        </div>

        <div className={`p-6 rounded-2xl border ${styles.panelBg} space-y-3 hover:border-indigo-500 transition-all`}>
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
            <Award className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base">Certeza Jurídica NOM-151</h3>
          <p className="text-xs opacity-75 leading-relaxed">
            Estampa de tiempo certificada ante la Secretaría de Economía y el CENAM con no-repudio absoluto admisible en tribunales mercantiles y ante el SAT.
          </p>
        </div>
      </div>

      {/* Feature Comparison Grid */}
      <div className={`w-full p-6 sm:p-8 rounded-2xl border ${styles.panelBg} space-y-6`}>
        <div className="text-center space-y-1">
          <h3 className="font-bold text-lg">¿Por qué Pactio en lugar de un acuerdo informal?</h3>
          <p className="text-xs opacity-75">Comparativa directa contra métodos tradicionales de contratación independiente.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/5 space-y-2">
            <span className="font-bold text-red-500 block">❌ Acuerdo en WhatsApp o PDF Estático</span>
            <ul className="space-y-1.5 opacity-80 list-disc list-inside">
              <li>El cliente posterga revisiones y congela pagos por meses.</li>
              <li>El cliente exige cambios infinitos argumentando que "no quedó claro".</li>
              <li>Sin valor probatorio certero ante auditorías del SAT (materialidad).</li>
              <li>El creador entrega archivos editables antes de recibir el finiquito.</li>
            </ul>
          </div>

          <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 space-y-2">
            <span className="font-bold text-emerald-500 block">✓ Pactio con Certificación NOM-151</span>
            <ul className="space-y-1.5 opacity-90 list-disc list-inside font-medium">
              <li>Aprobación tácita automática si el cliente no responde en 5 días.</li>
              <li>Rondas de ajustes parametrizadas (1 a 4) con cobro por ronda adicional.</li>
              <li>Estampa temporal CENAM con presunción legal de integridad.</li>
              <li>Reserva inamovible de derechos patrimoniales hasta liquidación al 100%.</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};
