import React, { useState, useEffect, useRef } from 'react';
import {
  Shield, CheckCircle2, FileText, FileSignature, Eye, Scale,
  BookOpen, HelpCircle, Send, RefreshCw, Sliders, Download,
  Search, Trash2, Copy, Check, AlertCircle, ArrowRight, ArrowLeft,
  Lock, Calendar, DollarSign, UserCheck, PenTool, Sparkles, X,
  Clock, CheckCheck, FileCode, Layers, ExternalLink, ChevronDown, ChevronUp
} from 'lucide-react';
import { useContractStore } from './core/store/contract-store';

type ThemeMode = 'midnight' | 'warm' | 'contrast';
type ActiveTab = 'creator' | 'vault' | 'client-review';

export default function App() {
  const store = useContractStore();
  const [theme, setTheme] = useState<ThemeMode>('midnight');
  const [activeTab, setActiveTab] = useState<ActiveTab>('creator');
  const [currentStep, setCurrentStep] = useState(1);
  const [fontScale, setFontScale] = useState(100);
  const [copiedCode, setCopiedCode] = useState(false);
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  
  // Negotiation Drawer state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [adjustedDays, setAdjustedDays] = useState(5);
  const [hasAdjustmentProposal, setHasAdjustmentProposal] = useState(false);
  
  // Signature Modal state
  const [isSignModalOpen, setIsSignModalOpen] = useState(false);
  const [signatureType, setSignatureType] = useState<'touch' | 'type' | 'efirma'>('touch');
  const [signatureDone, setSignatureDone] = useState(false);
  const [isStamping, setIsStamping] = useState(false);
  const [stampedSuccess, setStampedSuccess] = useState(false);
  const [stampingStep, setStampingStep] = useState(0);

  // Search in Vault
  const [searchQuery, setSearchQuery] = useState('');

  // Signature Canvas Ref
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // Copy NanoID
  const handleCopyNanoID = () => {
    navigator.clipboard.writeText(store.contractCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Drawing in Canvas
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    ctx.lineTo(x, y);
    ctx.strokeStyle = theme === 'contrast' ? '#000000' : '#1D4ED8';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.stroke();
    setSignatureDone(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSignatureDone(false);
  };

  // Run Stamping Simulation
  const handleStartStamping = () => {
    setIsStamping(true);
    setStampingStep(1);
    setTimeout(() => setStampingStep(2), 700);
    setTimeout(() => setStampingStep(3), 1500);
    setTimeout(() => setStampingStep(4), 2200);
    setTimeout(() => {
      setIsStamping(false);
      setStampedSuccess(true);
    }, 2800);
  };

  // Dynamic Theme Colors
  const themeClasses = {
    midnight: 'bg-slate-950 text-slate-100',
    warm: 'bg-[#F4EFEA] text-stone-900',
    contrast: 'bg-black text-white',
  }[theme];

  const paperClasses = {
    midnight: 'bg-white text-slate-900 border-slate-200 paper-shadow',
    warm: 'bg-[#FAF8F5] text-stone-900 border-[#E8DFD5] paper-shadow-warm',
    contrast: 'bg-white text-black border-4 border-yellow-400 shadow-none font-bold',
  }[theme];

  const panelBg = {
    midnight: 'bg-slate-900 border-slate-800',
    warm: 'bg-[#EFE8E0] border-[#DDD3C7] text-stone-900',
    contrast: 'bg-black border-2 border-white text-white',
  }[theme];

  return (
    <div className={`min-h-screen ${themeClasses} flex flex-col font-sans transition-colors duration-200`} style={{ fontSize: `${fontScale}%` }}>
      
      {/* =========================================================================
          TOP NAVIGATION BAR (ACCESSIBILITY, DUAL-VIEW, CODE, THEMES)
      ========================================================================== */}
      <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md px-4 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-3 shadow-sm">
        
        {/* Brand & Badge */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold tracking-tight text-xl bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">PACTIO</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-semibold">NOM-151</span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">Acuerdos digitales transparentes</p>
          </div>
        </div>

        {/* Contract Code NanoID Pill */}
        <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-700/60 rounded-lg px-3 py-1.5">
          <span className="text-[11px] text-slate-400 font-medium">Clave única:</span>
          <code className="font-mono text-xs font-bold text-blue-400 tracking-wider">{store.contractCode}</code>
          <button 
            onClick={handleCopyNanoID} 
            title="Copiar clave única"
            className="text-slate-400 hover:text-white transition-colors ml-1 p-0.5"
          >
            {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* View Switchers (Creator vs Vault vs Client Preview) */}
        <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('creator')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all font-medium ${
              activeTab === 'creator' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <PenTool className="w-3.5 h-3.5" />
            <span>Creador (Split-Pane)</span>
          </button>

          <button
            onClick={() => setActiveTab('vault')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all font-medium ${
              activeTab === 'vault' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Bóveda Dashboard</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('creator');
              setIsDrawerOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all font-medium text-amber-400 hover:bg-amber-500/10"
            title="Simular cómo el cliente recibe y negocia el contrato"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Simular Cliente</span>
          </button>
        </div>

        {/* Dual Language & Accessibility Controls */}
        <div className="flex items-center gap-2">
          {/* Dual Language Switch */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-xs">
            <button
              onClick={() => store.setPreviewMode('human')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded transition-all ${
                store.previewMode === 'human' ? 'bg-blue-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Eye className="w-3 h-3" />
              <span>Humana</span>
            </button>
            <button
              onClick={() => store.setPreviewMode('legal')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded transition-all ${
                store.previewMode === 'legal' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Scale className="w-3 h-3" />
              <span>Jurídica</span>
            </button>
          </div>

          {/* Theme Selector (Midnight, Warm, Contrast) */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-xs">
            <button
              onClick={() => setTheme('midnight')}
              className={`px-2 py-1 rounded ${theme === 'midnight' ? 'bg-slate-700 text-white' : 'text-slate-400'}`}
              title="Tema Medianoche"
            >
              🌙
            </button>
            <button
              onClick={() => setTheme('warm')}
              className={`px-2 py-1 rounded ${theme === 'warm' ? 'bg-[#D6C7B7] text-stone-900 font-bold' : 'text-slate-400'}`}
              title="Tema Papel Cálido (Lectura Kindle)"
            >
              📜
            </button>
            <button
              onClick={() => setTheme('contrast')}
              className={`px-2 py-1 rounded ${theme === 'contrast' ? 'bg-yellow-400 text-black font-extrabold' : 'text-slate-400'}`}
              title="Alto Contraste WCAG AAA"
            >
              ⚡
            </button>
          </div>

          {/* Text Scaler */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-xs">
            <button
              onClick={() => setFontScale(Math.max(85, fontScale - 10))}
              className="px-1.5 py-1 text-slate-400 hover:text-white font-bold"
              title="Disminuir texto"
            >
              A-
            </button>
            <span className="text-[10px] text-slate-500 px-1 font-mono">{fontScale}%</span>
            <button
              onClick={() => setFontScale(Math.min(130, fontScale + 10))}
              className="px-1.5 py-1 text-slate-400 hover:text-white font-bold"
              title="Aumentar texto"
            >
              A+
            </button>
          </div>
        </div>
      </header>

      {/* =========================================================================
          MAIN CONTAINER (SPLIT-PANE CREATOR OR VAULT DASHBOARD)
      ========================================================================== */}
      <main className="flex-1 flex overflow-hidden">
        {activeTab === 'creator' ? (
          <div className="flex-1 flex flex-col lg:flex-row w-full max-w-[1700px] mx-auto overflow-hidden">
            
            {/* -------------------------------------------------------------
                LEFT PANEL: 5-STEP WIZARD (55% ON DESKTOP)
            -------------------------------------------------------------- */}
            <div className={`w-full lg:w-[52%] flex flex-col border-r border-slate-800 ${panelBg} overflow-y-auto`}>
              
              {/* Stepper Header */}
              <div className="sticky top-0 z-20 border-b border-slate-800/80 bg-slate-900/95 backdrop-blur-sm p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs uppercase font-mono tracking-wider text-blue-400 font-bold">
                    Paso {currentStep} de 5 · {
                      currentStep === 1 ? 'Partes & Identidad' :
                      currentStep === 2 ? 'Alcance & Entregables' :
                      currentStep === 3 ? 'Cobro & Hitos de Pago' :
                      currentStep === 4 ? 'Propiedad Intelectual (LFDA)' :
                      'Gobernanza & Salida'
                    }
                  </span>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span>Guardado automático</span>
                  </div>
                </div>

                {/* Stepper Progress Bar */}
                <div className="grid grid-cols-5 gap-1.5">
                  {[1, 2, 3, 4, 5].map((step) => (
                    <button
                      key={step}
                      onClick={() => setCurrentStep(step)}
                      className={`h-2 rounded-full transition-all ${
                        currentStep === step
                          ? 'bg-blue-500 shadow-sm shadow-blue-500/50'
                          : currentStep > step
                          ? 'bg-emerald-500'
                          : 'bg-slate-800'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Form Content by Step */}
              <div className="p-6 space-y-6 flex-1">
                
                {/* STEP 1: PARTIES */}
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-xl font-bold flex items-center gap-2">
                        <span>¿Quiénes celebran el acuerdo?</span>
                        <div className="relative inline-block">
                          <button
                            onClick={() => setActiveTooltip(activeTooltip === 'parties' ? null : 'parties')}
                            className="text-slate-400 hover:text-blue-400"
                          >
                            <HelpCircle className="w-4 h-4" />
                          </button>
                          {activeTooltip === 'parties' && (
                            <div className="absolute left-6 top-0 w-72 p-3 bg-slate-800 text-slate-200 text-xs rounded-xl shadow-2xl border border-slate-700 z-50">
                              <p className="font-semibold text-blue-400 mb-1">💡 Analogía cotidiana:</p>
                              <p>Como las escrituras de una casa; es indispensable registrar el nombre legal y RFC para que el contrato tenga validez mercantil y sea 100% deducible ante el SAT.</p>
                            </div>
                          )}
                        </div>
                      </h2>
                      <p className="text-xs text-slate-400 mt-1">
                        Datos del prestador independiente y del cliente (persona física o empresa).
                      </p>
                    </div>

                    {/* Creator Box */}
                    <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Tus datos (Prestador)</span>
                        <span className="text-[10px] text-slate-500 font-mono">RESICO / Actividad Prof.</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs text-slate-400">Tu nombre completo o razón social</label>
                          <input
                            type="text"
                            value={store.parties.creator.legalName}
                            onChange={(e) => store.updateCreator({ legalName: e.target.value })}
                            className="w-full mt-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-slate-400">RFC con Homoclave (SAT)</label>
                          <div className="relative">
                            <input
                              type="text"
                              value={store.parties.creator.rfc}
                              onChange={(e) => store.updateCreator({ rfc: e.target.value.toUpperCase() })}
                              className="w-full mt-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white font-mono focus:outline-none focus:border-blue-500 uppercase"
                            />
                            <span className="absolute right-3 top-3 text-emerald-400 text-xs flex items-center gap-1 font-mono">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Válido
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Client Box */}
                    <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Datos del Cliente (Receptor)</span>
                        <select
                          value={store.parties.client.personType}
                          onChange={(e) => store.updateClient({ personType: e.target.value as any })}
                          className="bg-slate-900 border border-slate-700 text-xs text-slate-300 rounded px-2 py-1"
                        >
                          <option value="physical">Persona Física</option>
                          <option value="moral">Persona Moral (Empresa)</option>
                        </select>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs text-slate-400">Nombre de la empresa o cliente</label>
                          <input
                            type="text"
                            value={store.parties.client.legalName}
                            onChange={(e) => store.updateClient({ legalName: e.target.value })}
                            className="w-full mt-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-slate-400">Correo para Magic Link</label>
                          <input
                            type="email"
                            value={store.parties.client.email}
                            onChange={(e) => store.updateClient({ email: e.target.value })}
                            className="w-full mt-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 2: SCOPE */}
                {currentStep === 2 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-xl font-bold flex items-center gap-2">
                        <span>¿Qué vas a entregar exactamente?</span>
                        <button
                          onClick={() => setActiveTooltip(activeTooltip === 'scope' ? null : 'scope')}
                          className="text-slate-400 hover:text-blue-400"
                        >
                          <HelpCircle className="w-4 h-4" />
                        </button>
                      </h2>
                      {activeTooltip === 'scope' && (
                        <div className="p-3 my-2 bg-slate-800 text-slate-200 text-xs rounded-xl border border-slate-700">
                          <p className="font-semibold text-blue-400">💡 Cláusula Anti-Mora:</p>
                          <p>No se puede construir sin ladrillos. Los días de entrega empiezan a contar SOLO cuando el cliente te entregue accesos y contenidos.</p>
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="text-xs text-slate-400">Título del proyecto</label>
                        <input
                          type="text"
                          value={store.scope.projectTitle}
                          onChange={(e) => store.updateScope({ projectTitle: e.target.value })}
                          className="w-full mt-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="text-xs text-slate-400">Descripción del alcance</label>
                        <textarea
                          rows={3}
                          value={store.scope.description}
                          onChange={(e) => store.updateScope({ description: e.target.value })}
                          className="w-full mt-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      <div className="p-4 rounded-xl bg-blue-950/20 border border-blue-900/40">
                        <div className="flex items-center gap-2 text-blue-400 text-xs font-bold mb-2">
                          <Clock className="w-4 h-4" />
                          <span>Condición de Insumos Previos (Blindaje de Tiempo)</span>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          "Los plazos de entrega pactados iniciarán su cómputo únicamente a partir de la fecha en que el Cliente proporcione la totalidad de los accesos, credenciales e insumos técnicos requeridos."
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 3: PAYMENTS */}
                {currentStep === 3 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-xl font-bold flex items-center gap-2">
                        <span>¿Cuánto y cómo se va a cobrar?</span>
                        <button
                          onClick={() => setActiveTooltip(activeTooltip === 'milestones' ? null : 'milestones')}
                          className="text-slate-400 hover:text-blue-400"
                        >
                          <HelpCircle className="w-4 h-4" />
                        </button>
                      </h2>
                      {activeTooltip === 'milestones' && (
                        <div className="p-3 my-2 bg-slate-800 text-slate-200 text-xs rounded-xl border border-slate-700">
                          <p className="font-semibold text-blue-400">💡 La Regla del Anticipo:</p>
                          <p>Trabajar sin anticipo es el error #1 de los freelancers. Pactio estructura el 50% inicial para blindar tu tiempo.</p>
                        </div>
                      )}
                    </div>

                    {/* Total Amount & Currency */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-slate-400">Monto total del proyecto</label>
                        <div className="relative mt-1">
                          <span className="absolute left-3 top-2.5 text-slate-500 text-sm">$</span>
                          <input
                            type="number"
                            value={store.payments.totalAmountCents / 100}
                            onChange={(e) => {
                              const val = Math.max(0, parseFloat(e.target.value) || 0) * 100;
                              // Update store total
                            }}
                            className="w-full pl-7 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white font-mono focus:outline-none focus:border-blue-500"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs text-slate-400">Moneda contractual</label>
                        <select className="w-full mt-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500">
                          <option value="MXN">MXN (Pesos Mexicanos)</option>
                          <option value="USD">USD (Dólares Americanos)</option>
                        </select>
                      </div>
                    </div>

                    {/* Milestones Balance Bar */}
                    <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">Distribución de Pagos</span>
                        <span className="text-emerald-400 font-bold font-mono">100% Balanceado (2 hitos)</span>
                      </div>

                      {/* Visual Bar */}
                      <div className="w-full h-3 bg-slate-800 rounded-full flex overflow-hidden">
                        <div className="bg-blue-500 h-full w-1/2 flex items-center justify-center text-[9px] font-bold text-white">50%</div>
                        <div className="bg-emerald-500 h-full w-1/2 flex items-center justify-center text-[9px] font-bold text-white">50%</div>
                      </div>

                      {/* Milestones List */}
                      <div className="space-y-2 pt-2">
                        <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                          <div>
                            <span className="text-xs font-bold text-blue-400 block">Hito 1: Anticipo al iniciar (50%)</span>
                            <span className="text-[11px] text-slate-400">Requisito previo para arrancar actividades</span>
                          </div>
                          <span className="text-sm font-mono font-bold text-white">$20,000 MXN</span>
                        </div>

                        <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                          <div>
                            <span className="text-xs font-bold text-emerald-400 block">Hito 2: Finiquito contra entrega (50%)</span>
                            <span className="text-[11px] text-slate-400">Aprobación final de entregables</span>
                          </div>
                          <span className="text-sm font-mono font-bold text-white">$20,000 MXN</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 4: INTELLECTUAL PROPERTY */}
                {currentStep === 4 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-xl font-bold flex items-center gap-2">
                        <span>Propiedad Intelectual y Derechos</span>
                        <button
                          onClick={() => setActiveTooltip(activeTooltip === 'ip' ? null : 'ip')}
                          className="text-slate-400 hover:text-blue-400"
                        >
                          <HelpCircle className="w-4 h-4" />
                        </button>
                      </h2>
                      {activeTooltip === 'ip' && (
                        <div className="p-3 my-2 bg-slate-800 text-slate-200 text-xs rounded-xl border border-slate-700">
                          <p className="font-semibold text-blue-400">💡 La Cláusula de Oro:</p>
                          <p>Como entregar las llaves de un auto; no las sueltas hasta que el dinero esté completo en tu cuenta bancaria.</p>
                        </div>
                      )}
                    </div>

                    {/* Gold Lock Card */}
                    <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/30 via-slate-900 to-slate-950 border border-emerald-500/30 space-y-3">
                      <div className="flex items-center gap-2 text-emerald-400">
                        <Lock className="w-5 h-5" />
                        <h3 className="font-bold text-sm">Reserva de Dominio (Pago 100% Obligatorio)</h3>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        Conforme al <strong>Artículo 83 de la Ley Federal del Derecho de Autor (LFDA)</strong>, la cesión de derechos patrimoniales sobre los diseños y código opera <strong>única y exclusivamente sujeta a la condición suspensiva de liquidación del 100% del precio pactado</strong>.
                      </p>
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 text-[11px] font-semibold border border-emerald-500/20">
                        <Check className="w-3.5 h-3.5" /> Cláusula blindada activada por defecto
                      </div>
                    </div>

                    {/* Portfolio Rights Toggle */}
                    <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-white">Derecho de Exhibición en Portafolio</h4>
                        <p className="text-[11px] text-slate-400">Te permite mostrar el trabajo en tu web y redes profesionales</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={store.intellectualProperty.creatorPortfolioRights}
                        onChange={(e) => store.intellectualProperty.creatorPortfolioRights = e.target.checked}
                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                )}

                {/* STEP 5: GOVERNANCE & CLOSE */}
                {currentStep === 5 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-xl font-bold flex items-center gap-2">
                        <span>Gobernanza y Reglas de Salida</span>
                        <button
                          onClick={() => setActiveTooltip(activeTooltip === 'gov' ? null : 'gov')}
                          className="text-slate-400 hover:text-blue-400"
                        >
                          <HelpCircle className="w-4 h-4" />
                        </button>
                      </h2>
                      {activeTooltip === 'gov' && (
                        <div className="p-3 my-2 bg-slate-800 text-slate-200 text-xs rounded-xl border border-slate-700">
                          <p className="font-semibold text-blue-400">💡 Silencio Tácito:</p>
                          <p>El que calla otorga. Si el cliente no responde en 5 días tras la entrega, se aprueba automáticamente para que no te frenen el pago.</p>
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                        <div>
                          <h4 className="text-xs font-bold text-white">Rondas de Ajustes Incluidas</h4>
                          <p className="text-[11px] text-slate-400">Límite para evitar cambios infinitos (Scope Creep)</p>
                        </div>
                        <span className="px-3 py-1 bg-slate-800 text-blue-400 font-bold rounded-lg text-sm">2 rondas</span>
                      </div>

                      <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                        <div>
                          <h4 className="text-xs font-bold text-white">Ventana de Aceptación Tácita</h4>
                          <p className="text-[11px] text-slate-400">Días para revisar antes de aprobación automática</p>
                        </div>
                        <span className="px-3 py-1 bg-slate-800 text-emerald-400 font-bold rounded-lg text-sm">5 días hábiles</span>
                      </div>

                      <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                        <div>
                          <h4 className="text-xs font-bold text-white">Salida Limpia (Kill Fee)</h4>
                          <p className="text-[11px] text-slate-400">Si el cliente cancela sin causa justificada</p>
                        </div>
                        <span className="px-3 py-1 bg-slate-800 text-amber-400 font-bold rounded-lg text-sm">50% retenido</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Wizard Bottom Controls */}
              <div className="sticky bottom-0 z-20 border-t border-slate-800/80 bg-slate-900/95 backdrop-blur-sm p-4 flex items-center justify-between">
                <button
                  disabled={currentStep === 1}
                  onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white disabled:opacity-30"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Anterior</span>
                </button>

                <div className="flex items-center gap-2">
                  {currentStep < 5 ? (
                    <button
                      onClick={() => setCurrentStep(Math.min(5, currentStep + 1))}
                      className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30 transition-all"
                    >
                      <span>Siguiente paso</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={() => setIsSignModalOpen(true)}
                      className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white text-xs font-bold shadow-lg shadow-emerald-500/30 transition-all animate-pulse"
                    >
                      <FileSignature className="w-4 h-4" />
                      <span>Proceder a Firma & Timbrado</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* -------------------------------------------------------------
                RIGHT PANEL: CANONICAL DOCUMENT PREVIEW (48% ON DESKTOP)
            -------------------------------------------------------------- */}
            <div className="w-full lg:w-[48%] bg-slate-950 p-6 lg:p-8 overflow-y-auto flex justify-center items-start">
              
              {/* The Paper Sheet */}
              <div className={`w-full max-w-[760px] p-8 lg:p-12 rounded-lg transition-all duration-300 ${paperClasses}`}>
                
                {/* Document Header */}
                <div className="border-b pb-6 mb-6 flex items-start justify-between">
                  <div>
                    <span className="text-[11px] font-mono tracking-widest text-slate-500 uppercase block mb-1">
                      DOCUMENTO OFICIAL PACTIO · ID: {store.contractCode}
                    </span>
                    <h1 className="text-xl lg:text-2xl font-serif font-bold tracking-tight">
                      CONTRATO DE PRESTACIÓN DE SERVICIOS DIGITALES
                    </h1>
                    <p className="text-xs text-slate-500 mt-1">
                      Celebrado con fundamento en los Artículos 89 al 95 del Código de Comercio y NOM-151-SCFI-2016
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700">
                    <Shield className="w-6 h-6" />
                  </div>
                </div>

                {/* DUAL VIEW RENDERER (HUMAN VS LEGAL) */}
                {store.previewMode === 'human' ? (
                  /* =========================================================
                     VISTA HUMANA: CARÁTULA EJECUTIVA DE 4 CUADRANTES
                  ========================================================== */
                  <div className="space-y-6">
                    <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 flex items-center gap-2 text-blue-900 text-xs">
                      <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
                      <span><strong>Modo Ciudadano Activo:</strong> Términos explicados en lenguaje transparente sin letras chiquitas.</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Box 1: Insumos */}
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                        <span className="text-[10px] font-bold text-blue-600 uppercase font-mono tracking-wider">1. ¿Qué se entrega?</span>
                        <h4 className="text-sm font-bold text-slate-900 mt-1">{store.scope.projectTitle}</h4>
                        <p className="text-xs text-slate-600 mt-1">{store.scope.description}</p>
                      </div>

                      {/* Box 2: Cronograma */}
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                        <span className="text-[10px] font-bold text-emerald-600 uppercase font-mono tracking-wider">2. ¿Cuándo se entrega?</span>
                        <h4 className="text-sm font-bold text-slate-900 mt-1">Tiempo de Entrega: 30 días</h4>
                        <p className="text-xs text-slate-600 mt-1">Los plazos corren solo cuando entregues los accesos necesarios.</p>
                      </div>

                      {/* Box 3: Pagos */}
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                        <span className="text-[10px] font-bold text-amber-600 uppercase font-mono tracking-wider">3. ¿Cuánto y cómo se paga?</span>
                        <h4 className="text-base font-bold text-slate-900 mt-1">$40,000 MXN</h4>
                        <p className="text-xs text-slate-600 mt-1">50% al arrancar ($20,000) y 50% al entregar el proyecto final.</p>
                      </div>

                      {/* Box 4: Cambios */}
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                        <span className="text-[10px] font-bold text-indigo-600 uppercase font-mono tracking-wider">4. ¿Y si necesitas cambios?</span>
                        <h4 className="text-sm font-bold text-slate-900 mt-1">2 Rondas de Ajustes Incluidas</h4>
                        <p className="text-xs text-slate-600 mt-1">Tienes 5 días para revisar cada hito; ajustes extra se cotizan aparte.</p>
                      </div>
                    </div>

                    {/* Golden Rule Banner */}
                    <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
                      <Lock className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-xs font-bold text-emerald-950">Garantía Bilateral de Propiedad Intelectual</h4>
                        <p className="text-xs text-emerald-900 mt-0.5 leading-relaxed">
                          Los archivos y derechos son tuyos en cuanto se liquide el 100% del pago. Ambas partes protegidas sin ambigüedades.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* =========================================================
                     VISTA JURÍDICA: CLÁUSULAS CANÓNICAS FORMALES
                  ========================================================== */
                  <div className="space-y-6 font-serif text-sm leading-relaxed text-slate-800">
                    <section>
                      <h3 className="font-sans font-bold text-xs uppercase tracking-wider text-slate-500 mb-2">DECLARACIONES</h3>
                      <p className="text-xs mb-2">
                        I. Declara <strong>{store.parties.creator.legalName}</strong> con RFC <strong>{store.parties.creator.rfc}</strong> contar con capacidad técnica y legal bastante para obligarse...
                      </p>
                      <p className="text-xs">
                        II. Declara <strong>{store.parties.client.legalName}</strong> estar interesada en contratar los servicios del Prestador bajo los términos estipulados...
                      </p>
                    </section>

                    <section className="space-y-4">
                      <h3 className="font-sans font-bold text-xs uppercase tracking-wider text-slate-500 mb-2">CLÁUSULAS</h3>
                      
                      <div className="p-3 rounded-lg border border-transparent hover:border-blue-200 transition-colors">
                        <h4 className="font-bold text-xs font-sans text-slate-900">PRIMERA. OBJETO Y ALCANCE</h4>
                        <p className="text-xs mt-1 text-slate-700">El Prestador se obliga a desarrollar y entregar: <strong>{store.scope.projectTitle}</strong> conforme a las especificaciones acordadas.</p>
                      </div>

                      <div className="p-3 rounded-lg border border-transparent hover:border-blue-200 transition-colors">
                        <h4 className="font-bold text-xs font-sans text-slate-900">SEGUNDA. CONTRAPRESTACIÓN Y CONDICIÓN DE PAGO</h4>
                        <p className="text-xs mt-1 text-slate-700">El Cliente pagará la cantidad total de <strong>$40,000.00 MXN</strong> distribuida en dos exhibiciones al 50% cada una.</p>
                      </div>

                      <div className="p-3 rounded-lg border border-emerald-100 bg-emerald-50/40">
                        <h4 className="font-bold text-xs font-sans text-emerald-900">TERCERA. RESERVA DE DERECHOS PATRIMONIALES (ART. 83 LFDA)</h4>
                        <p className="text-xs mt-1 text-emerald-950">
                          La transmisión de derechos patrimoniales sobre los entregables queda expresamente sujeta a la <strong>condición suspensiva de liquidación del 100% de la contraprestación</strong> pactada.
                        </p>
                      </div>

                      <div className="p-3 rounded-lg border border-transparent hover:border-blue-200 transition-colors">
                        <h4 className="font-bold text-xs font-sans text-slate-900">CUARTA. APROBACIÓN TÁCITA POR SILENCIO</h4>
                        <p className="text-xs mt-1 text-slate-700">El Cliente contará con un plazo de <strong>5 (cinco) días hábiles</strong> posteriores a cada entrega para formular observaciones fundamentadas; fenecido dicho plazo sin notificación, se tendrá por tácitamente aprobado el hito.</p>
                      </div>
                    </section>

                    {/* Legal Stamp Footer */}
                    <div className="pt-6 border-t border-slate-200 mt-8 flex items-center justify-between text-[11px] text-slate-500 font-sans">
                      <span>Hash canónico: SHA-256 e3b0c442...</span>
                      <span className="font-mono">Certificación NOM-151</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* =========================================================================
              VAULT DASHBOARD TAB (BÓVEDA DE CONTRATOS, SEARCH O(1), RENEWAL)
          ========================================================================== */
          <div className="flex-1 max-w-6xl mx-auto p-6 lg:p-10 w-full space-y-6 overflow-y-auto">
            
            {/* Header & Stats */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Bóveda de Acuerdos</h1>
                <p className="text-xs text-slate-400 mt-1">Historial criptográfico, gestión de vigencias y renovación en 1 clic.</p>
              </div>

              {/* Instant Search O(1) */}
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Buscar por clave PACT-XXXXX o cliente..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Contract Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              
              {/* Card 1: Active Contract */}
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                    PACT-8X9K2
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Firmado NOM-151
                  </span>
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">Diseño UI/UX App Fintech</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Cliente: Finanzas Digitales S.A. de C.V.</p>
                </div>
                <div className="text-xs text-slate-400 flex items-center justify-between pt-2 border-t border-slate-800">
                  <span>Monto: $40,000 MXN</span>
                  <span className="text-slate-500">Vence: 15 Dic 2026</span>
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={() => {
                      alert('¡Contrato clonado con éxito! Se ha generado una nueva clave PACT-9Y1L3 con nuevo UUID para renovación.');
                    }}
                    className="flex-1 py-1.5 px-3 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Renovar en 1 Clic</span>
                  </button>
                  <button className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white">
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Card 2: Draft Contract */}
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                    PACT-3M8N1
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    Borrador v1.0
                  </span>
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">Desarrollo Web E-commerce</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Cliente: Boutique Retail México</p>
                </div>
                <div className="text-xs text-slate-400 flex items-center justify-between pt-2 border-t border-slate-800">
                  <span>Monto: $65,000 MXN</span>
                  <span className="text-slate-500">Editado hace 2h</span>
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <button 
                    onClick={() => setActiveTab('creator')}
                    className="flex-1 py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <PenTool className="w-3.5 h-3.5" />
                    <span>Continuar Edición</span>
                  </button>
                  <button 
                    onClick={() => alert('Borrador descartado correctamente de la bóveda.')}
                    className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400"
                    title="Eliminar borrador"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* =========================================================================
          NEGOTIATION DRAWER SIMULATOR (`[Solicitar Ajuste]` - ANTI-HAPPY PATH)
      ========================================================================== */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm transition-all animate-fadeIn">
          <div className="w-full max-w-md bg-slate-900 border-l border-slate-800 h-full p-6 flex flex-col justify-between overflow-y-auto">
            <div className="space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-amber-400" />
                  <h3 className="font-bold text-base text-white">Simulador Cliente: Ajustar Términos</h3>
                </div>
                <button onClick={() => setIsDrawerOpen(false)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-300 leading-relaxed">
                <strong>Gobernanza Paramétrica Activa:</strong> El cliente puede negociar fechas y balances de hitos, pero las cláusulas de Propiedad Intelectual y penas por mora están legalmente blindadas.
              </div>

              {/* Parametric Option 1: Extend Review Days */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">Días para revisar entregables</label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="3"
                    max="10"
                    value={adjustedDays}
                    onChange={(e) => setAdjustedDays(parseInt(e.target.value))}
                    className="flex-1 accent-blue-500"
                  />
                  <span className="px-3 py-1 bg-slate-800 rounded font-mono font-bold text-sm text-blue-400">
                    {adjustedDays} días
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">Propuesta original: 5 días hábiles</p>
              </div>

              {/* Parametric Option 2: Note */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">Nota del Cliente al Creador</label>
                <textarea
                  rows={3}
                  defaultValue="Oye Sofía, ¿nos podrías dar 7 días hábiles para que nuestro comité de diseño pueda validar cada hito con calma?"
                  className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none"
                />
              </div>

              {/* Semantic Diff Preview */}
              {hasAdjustmentProposal && (
                <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/40 space-y-2">
                  <span className="text-[10px] font-bold uppercase text-emerald-400 font-mono">Diff Semántico v1.1 Propuesto</span>
                  <div className="text-xs font-mono space-y-1">
                    <p className="text-red-400 line-through">- Cláusula 4: Ventana de 5 días hábiles</p>
                    <p className="text-emerald-400 font-bold">+ Cláusula 4: Ventana de {adjustedDays} días hábiles</p>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-800 space-y-2">
              {!hasAdjustmentProposal ? (
                <button
                  onClick={() => setHasAdjustmentProposal(true)}
                  className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition-all"
                >
                  Enviar Propuesta de Ajuste al Creador
                </button>
              ) : (
                <button
                  onClick={() => {
                    alert('¡Versión v1.1 emitida y aprobada bilateralmente! El contrato está listo para firma.');
                    setIsDrawerOpen(false);
                    setHasAdjustmentProposal(false);
                  }}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>Creador Acepta Ajuste y Emite v1.1</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SIGNATURE MODAL & NOM-151 STAMPING ENGINE
      ========================================================================== */}
      {isSignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5 shadow-2xl">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FileSignature className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-base text-white">Centro de Firma & Timbrado Legal</h3>
              </div>
              <button onClick={() => setIsSignModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Signature Tabs */}
            {!isStamping && !stampedSuccess && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 rounded-xl text-xs">
                  <button
                    onClick={() => setSignatureType('touch')}
                    className={`py-2 rounded-lg font-semibold transition-all ${
                      signatureType === 'touch' ? 'bg-blue-600 text-white' : 'text-slate-400'
                    }`}
                  >
                    Firma Táctil Biometría
                  </button>
                  <button
                    onClick={() => setSignatureType('efirma')}
                    className={`py-2 rounded-lg font-semibold transition-all ${
                      signatureType === 'efirma' ? 'bg-indigo-600 text-white' : 'text-slate-400'
                    }`}
                  >
                    e.firma SAT (Zero-Knowledge)
                  </button>
                </div>

                {signatureType === 'touch' ? (
                  <div className="space-y-2">
                    <p className="text-xs text-slate-400">Dibuja tu firma con tu dedo o ratón sobre el lienzo:</p>
                    <div className="border-2 border-dashed border-slate-700 bg-white rounded-xl overflow-hidden relative">
                      <canvas
                        ref={canvasRef}
                        width={460}
                        height={160}
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onTouchStart={startDrawing}
                        onTouchMove={draw}
                        onTouchEnd={stopDrawing}
                        className="cursor-crosshair w-full h-40 touch-none"
                      />
                      {!signatureDone && (
                        <div className="absolute inset-0 pointer-events-none flex items-center justify-center text-slate-400 text-xs font-medium">
                          Rúbrica digital aquí
                        </div>
                      )}
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-[11px] text-slate-500">Vector Bézier temporal ~2 KB</span>
                      <button onClick={clearCanvas} className="text-slate-400 hover:text-red-400">
                        Limpiar lienzo
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 text-xs text-slate-300">
                    <div className="flex items-center gap-2 text-indigo-400 font-bold">
                      <Shield className="w-4 h-4" />
                      <span>Firma con Llave Privada del SAT</span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Tus archivos .cer y .key se procesan 100% en la memoria de tu navegador (Web Worker). Nunca tocan los servidores de Pactio.
                    </p>
                    <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg text-center cursor-pointer hover:border-slate-700">
                      Cargar certificado .cer y llave .key
                    </div>
                  </div>
                )}

                {/* Confirm Action */}
                <button
                  disabled={signatureType === 'touch' && !signatureDone}
                  onClick={handleStartStamping}
                  className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 disabled:opacity-40 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
                >
                  <Shield className="w-4 h-4" />
                  <span>Firmar y Obtener Sello NOM-151 Oficial</span>
                </button>
              </div>
            )}

            {/* Stamping Simulation Stepper */}
            {isStamping && (
              <div className="py-8 space-y-4 text-center">
                <div className="w-12 h-12 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin mx-auto"></div>
                <h4 className="font-bold text-white text-sm">Timbrando con Prestador de Certificación (PSC)...</h4>
                <div className="space-y-2 max-w-xs mx-auto text-xs text-slate-400 font-mono text-left">
                  <div className={`flex items-center gap-2 ${stampingStep >= 1 ? 'text-emerald-400' : 'text-slate-600'}`}>
                    <CheckCheck className="w-3.5 h-3.5" /> 1. Digest SHA-256 generado
                  </div>
                  <div className={`flex items-center gap-2 ${stampingStep >= 2 ? 'text-emerald-400' : 'text-slate-600'}`}>
                    <CheckCheck className="w-3.5 h-3.5" /> 2. Transmisión a HSM FIPS Nivel 3
                  </div>
                  <div className={`flex items-center gap-2 ${stampingStep >= 3 ? 'text-emerald-400' : 'text-slate-600'}`}>
                    <CheckCheck className="w-3.5 h-3.5" /> 3. Estampa atómica CENAM UTC
                  </div>
                  <div className={`flex items-center gap-2 ${stampingStep >= 4 ? 'text-emerald-400' : 'text-slate-600'}`}>
                    <CheckCheck className="w-3.5 h-3.5" /> 4. Emisión Constancia ASN.1 DER
                  </div>
                </div>
              </div>
            )}

            {/* Success State & Kit Download */}
            {stampedSuccess && (
              <div className="py-6 space-y-5 text-center">
                <div className="w-14 h-14 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/30">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="font-bold text-lg text-white">¡Contrato Formalizado con Éxito!</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Cuenta con presunción de integridad y fecha cierta ante el SAT y juzgados mercantiles.
                  </p>
                </div>

                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-left space-y-2 text-xs">
                  <span className="text-[10px] font-mono font-bold text-blue-400 uppercase">Kit de Respaldo Fiscal Incluido:</span>
                  <div className="space-y-1 text-slate-300 font-mono text-[11px]">
                    <p>📄 Contrato_Formalizado_v1.1.pdf</p>
                    <p>🔐 Constancia_NOM151.der (ASN.1 Sello CENAM)</p>
                    <p>📊 Bitacora_Materialidad_SAT.json (Art. 69-B CFF)</p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    alert('Descargando Kit de Respaldo Fiscal ZIP...');
                    setIsSignModalOpen(false);
                    setStampedSuccess(false);
                  }}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
                >
                  <Download className="w-4 h-4" />
                  <span>Descargar Kit de Respaldo Fiscal (.ZIP)</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
