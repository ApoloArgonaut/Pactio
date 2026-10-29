import React, { useState, useEffect, useRef } from 'react';
import {
  Shield, CheckCircle2, FileText, FileSignature, Eye, Scale,
  BookOpen, HelpCircle, Send, RefreshCw, Sliders, Download,
  Search, Trash2, Copy, Check, AlertCircle, ArrowRight, ArrowLeft,
  Lock, Calendar, DollarSign, UserCheck, PenTool, Sparkles, X,
  Clock, CheckCheck, FileCode, Layers, ExternalLink, ChevronDown, ChevronUp,
  Printer, Home, User, Users, Share2, Award, Zap, CheckSquare, Plus,
  CreditCard, Globe, Landmark, AlertTriangle, FileKey, Info
} from 'lucide-react';
import { useContractStore, PreviewMode } from './core/store/contract-store';
import type { Milestone } from './core/schemas/milestone';

type ThemeMode = 'midnight' | 'warm' | 'contrast';
type ActiveTab = 'landing' | 'creator' | 'vault' | 'client-review' | 'confirmed';

export default function App() {
  const store = useContractStore();
  const [theme, setTheme] = useState<ThemeMode>('midnight');
  const [activeTab, setActiveTab] = useState<ActiveTab>('landing');
  const [currentStep, setCurrentStep] = useState(1);
  const [fontScale, setFontScale] = useState(100);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  
  // Negotiation Drawer state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [adjustedDays, setAdjustedDays] = useState(5);
  const [hasAdjustmentProposal, setHasAdjustmentProposal] = useState(false);
  
  // Signature Modal state
  const [isSignModalOpen, setIsSignModalOpen] = useState(false);
  const [signatureType, setSignatureType] = useState<'touch' | 'type' | 'efirma'>('touch');
  const [typedName, setTypedName] = useState('Sofía Valenzuela Mendoza');
  const [signatureDone, setSignatureDone] = useState(false);
  const [isStamping, setIsStamping] = useState(false);
  const [stampedSuccess, setStampedSuccess] = useState(false);
  const [stampingStep, setStampingStep] = useState(0);

  // Search & Filtering in Vault
  const [searchQuery, setSearchQuery] = useState('');

  // Payment Method selection
  const [paymentMethod, setPaymentMethod] = useState<'spei' | 'stripe' | 'wise'>('spei');

  // Sync Tailwind Dark Mode and Data-Theme with HTML Root
  useEffect(() => {
    if (theme === 'warm') {
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'warm');
    } else {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', theme);
    }
  }, [theme]);

  // Signature Canvas Ref
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // Open Signature Modal safely (resets state so it never opens blank)
  const openSignatureModal = () => {
    setStampedSuccess(false);
    setIsStamping(false);
    setStampingStep(0);
    setSignatureDone(false);
    setIsSignModalOpen(true);
  };

  // Copy NanoID
  const handleCopyNanoID = () => {
    navigator.clipboard.writeText(store.contractCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Copy Public Link
  const handleCopyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Canvas Drawing Handlers
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

  // Stamping Simulation Handler
  const handleStartStamping = () => {
    setIsStamping(true);
    setStampingStep(1);
    setTimeout(() => setStampingStep(2), 600);
    setTimeout(() => setStampingStep(3), 1300);
    setTimeout(() => setStampingStep(4), 2000);
    setTimeout(() => {
      setIsStamping(false);
      setStampedSuccess(true);
      setIsSignModalOpen(false);
      setActiveTab('confirmed');
    }, 2600);
  };

  // Real File Downloads
  const downloadContractMarkdown = () => {
    const element = document.createElement('a');
    const file = new Blob([store.cachedCanonicalMarkdown || '# Contrato Pactio'], { type: 'text/markdown;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = `${store.contractCode}_Contrato_Formalizado.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const downloadNOM151Receipt = () => {
    const payload = {
      specVersion: 'NOM-151-SCFI-2016',
      contractId: store.id,
      contractCode: store.contractCode,
      documentHash: store.cachedDocumentHash,
      timestampUtc: new Date().toISOString(),
      cenamClockSync: 'ACTIVE_NTP_STRATUM_1',
      pscProvider: 'PSC_MIFIEL_CECOBAN_AUTH_SE',
      parties: {
        creatorRfc: store.parties.creator.rfc,
        clientRfc: store.parties.client.rfc,
      },
      paymentPlan: {
        currency: store.payments.currency,
        totalAmountFormatted: `${(store.payments.totalAmountCents / 100).toLocaleString()} ${store.payments.currency}`,
        milestonesCount: store.payments.milestones.length
      },
      integrityProof: 'ASN1_DER_ENCODED_BINARY_TOKEN_MOCK_VALID'
    };
    const element = document.createElement('a');
    const file = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = `${store.contractCode}_Constancia_NOM151.json`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handlePrint = () => {
    window.print();
  };

  // Dynamic Theme Classes
  const themeClasses = {
    midnight: 'bg-slate-950 text-slate-100',
    warm: 'bg-[#F4EFEA] text-stone-900',
    contrast: 'bg-black text-white',
  }[theme];

  const headerBg = {
    midnight: 'bg-slate-950/95 border-slate-800/80 text-white',
    warm: 'bg-[#FAF8F5]/95 border-[#E2D7C8] text-stone-900 shadow-sm',
    contrast: 'bg-black border-b-2 border-yellow-400 text-white',
  }[theme];

  const panelBg = {
    midnight: 'bg-slate-900/90 border-slate-800 text-slate-100',
    warm: 'bg-[#FAF8F5] border-[#E8DFD5] text-stone-900',
    contrast: 'bg-black border-2 border-white text-white',
  }[theme];

  const inputClass = {
    midnight: 'w-full px-3.5 py-2.5 bg-slate-950/90 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 hover:border-slate-500 transition-all duration-150',
    warm: 'w-full px-3.5 py-2.5 bg-white border border-[#D6C7B2] rounded-xl text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:border-[#8C6D46] focus:ring-2 focus:ring-[#8C6D46]/20 hover:border-stone-400 shadow-sm transition-all duration-150',
    contrast: 'w-full px-3.5 py-2.5 bg-black border-2 border-yellow-400 rounded-xl text-sm text-yellow-300 font-bold focus:outline-none focus:ring-2 focus:ring-white transition-all duration-150',
  }[theme];

  const labelClass = {
    midnight: 'block text-xs font-semibold text-slate-300 mb-1.5',
    warm: 'block text-xs font-semibold text-stone-700 mb-1.5',
    contrast: 'block text-xs font-bold text-yellow-300 mb-1.5 uppercase',
  }[theme];

  const paperClasses = {
    midnight: 'bg-white text-slate-900 border border-slate-200 paper-shadow',
    warm: 'bg-[#FAF8F5] text-stone-900 border border-[#E8DFD5] paper-shadow-warm',
    contrast: 'bg-white text-black border-4 border-yellow-400 shadow-none font-bold',
  }[theme];

  const pillClass = {
    midnight: 'bg-slate-900/90 border-slate-700/60 text-slate-300',
    warm: 'bg-[#EFE8DF] border-[#D9CEBF] text-stone-800',
    contrast: 'bg-black border border-yellow-400 text-yellow-300',
  }[theme];

  const infoBoxClass = {
    midnight: 'p-4 rounded-xl bg-blue-950/30 border border-blue-900/50 text-blue-200',
    warm: 'p-4 rounded-xl bg-[#F5EFE6] border border-[#DDD3C3] text-stone-800 shadow-sm',
    contrast: 'p-4 rounded-xl bg-black border-2 border-yellow-400 text-white',
  }[theme];

  const ipBannerClass = {
    midnight: 'p-4 rounded-xl bg-emerald-950/40 border border-emerald-600/70 text-emerald-100 shadow-sm',
    warm: 'p-4 rounded-xl bg-[#EAF5EF] border border-[#B7DEC7] text-emerald-950 shadow-sm',
    contrast: 'p-4 rounded-xl bg-black border-2 border-green-400 text-green-300',
  }[theme];

  const previewBackdropClass = {
    midnight: 'w-full lg:w-[48%] bg-slate-900/40 p-6 lg:p-8 overflow-y-auto flex flex-col items-center border-l border-slate-800/60',
    warm: 'w-full lg:w-[48%] bg-[#E8DFD3]/60 p-6 lg:p-8 overflow-y-auto flex flex-col items-center border-l border-[#DDD2C3]',
    contrast: 'w-full lg:w-[48%] bg-black p-6 lg:p-8 overflow-y-auto flex flex-col items-center border-l-2 border-yellow-400',
  }[theme];

  // High-Contrast Theme-Adapted Select and Option Classes
  const selectClass = {
    midnight: 'w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-sm font-semibold text-white focus:outline-none focus:border-blue-500 hover:border-slate-500 shadow-sm transition-all cursor-pointer [&>option]:bg-slate-900 [&>option]:text-white',
    warm: 'w-full px-3.5 py-2.5 bg-white border border-[#D6C7B2] rounded-xl text-sm font-semibold text-stone-900 focus:outline-none focus:border-[#8C6D46] hover:border-stone-400 shadow-sm transition-all cursor-pointer [&>option]:bg-white [&>option]:text-stone-900',
    contrast: 'w-full px-3.5 py-2.5 bg-black border-2 border-yellow-400 rounded-xl text-sm font-bold text-yellow-300 focus:outline-none shadow-none transition-all cursor-pointer [&>option]:bg-black [&>option]:text-yellow-300',
  }[theme];

  const inlineSelectClass = {
    midnight: 'px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-blue-500 hover:border-slate-500 shadow-sm transition-all cursor-pointer [&>option]:bg-slate-900 [&>option]:text-white',
    warm: 'px-3 py-1.5 bg-white border border-[#D6C7B2] rounded-xl text-xs font-bold text-stone-900 focus:outline-none focus:border-[#8C6D46] hover:border-stone-400 shadow-sm transition-all cursor-pointer [&>option]:bg-white [&>option]:text-stone-900',
    contrast: 'px-3 py-1.5 bg-black border-2 border-yellow-400 rounded-xl text-xs font-bold text-yellow-300 focus:outline-none shadow-none transition-all cursor-pointer [&>option]:bg-black [&>option]:text-yellow-300',
  }[theme];

  const optionClass = {
    midnight: 'bg-slate-900 text-white font-medium py-1.5',
    warm: 'bg-white text-stone-900 font-medium py-1.5',
    contrast: 'bg-black text-yellow-300 font-bold py-1.5',
  }[theme];

  // Cryptographic Inspector Popover state
  const [showAuditInspector, setShowAuditInspector] = useState(false);

  // Currency Symbol helper
  const currencySymbol = store.payments.currency === 'EUR' ? '€' : '$';

  // Total Milestones percentage sum
  const milestonesPercentSum = store.payments.milestones.reduce((acc, m) => acc + m.percentage, 0);
  const isPercentBalanced = Math.abs(milestonesPercentSum - 100) < 0.1;

  // Add custom milestone
  const handleAddMilestone = () => {
    const count = store.payments.milestones.length + 1;
    const remainingPercent = Math.max(0, 100 - milestonesPercentSum);
    const amount = Math.round((store.payments.totalAmountCents * remainingPercent) / 100);
    const newMilestone: Milestone = {
      id: `m${count}-${Date.now()}`,
      order: count,
      title: `Hito ${count}: Entregable adicional`,
      percentage: remainingPercent > 0 ? remainingPercent : 20,
      amountCents: amount > 0 ? amount : Math.round(store.payments.totalAmountCents * 0.2),
      deliverables: ['Revisión técnica y validación final'],
      status: 'pending'
    };
    store.addMilestone(newMilestone);
  };

  // Auto-balance milestones to exactly 100%
  const handleAutoBalance = () => {
    const list = store.payments.milestones;
    if (list.length === 0) return;
    const equalShare = Math.floor(100 / list.length);
    let rem = 100 - equalShare * list.length;
    list.forEach((m, idx) => {
      const p = equalShare + (idx === list.length - 1 ? rem : 0);
      const amt = Math.round((store.payments.totalAmountCents * p) / 100);
      store.updateMilestone(m.id, { percentage: p, amountCents: amt });
    });
  };

  const isSignReady = (signatureType === 'touch' && signatureDone) || 
                      (signatureType === 'type' && typedName.trim().length >= 3) ||
                      (signatureType === 'efirma');

  return (
    <div className={`min-h-screen ${themeClasses} theme-${theme} flex flex-col font-sans transition-colors duration-200`} data-theme={theme} style={{ fontSize: `${fontScale}%` }}>
      
      {/* =========================================================================
          TOP NAVIGATION BAR (ACCESSIBILITY, BRAND, DUAL-VIEW, CODE, THEMES)
      ========================================================================== */}
      <header className={`sticky top-0 z-40 border-b ${headerBg} backdrop-blur-md px-4 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-3 transition-colors duration-200`}>
        
        {/* Brand & Home Link */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setActiveTab('landing')}
            className="flex items-center gap-3 group text-left focus:outline-none"
            title="Volver a Inicio / Landing"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold tracking-tight text-xl bg-gradient-to-r from-blue-400 to-indigo-300 bg-clip-text text-transparent">PACTIO</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-500 border border-blue-500/30 font-semibold">NOM-151</span>
              </div>
              <p className="text-[11px] opacity-75 hidden sm:block">Acuerdos digitales transparentes</p>
            </div>
          </button>
        </div>

        {/* Contract Code NanoID Pill */}
        <div className={`flex items-center gap-2 border rounded-xl px-3 py-1.5 ${pillClass}`}>
          <span className="text-[11px] opacity-75 font-medium">Clave única:</span>
          <code className="font-mono text-xs font-bold text-blue-500 tracking-wider">{store.contractCode}</code>
          <button 
            onClick={handleCopyNanoID} 
            title="Copiar clave única de búsqueda"
            className="opacity-75 hover:opacity-100 hover:text-blue-500 transition-opacity ml-1 p-0.5"
          >
            {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* View Switchers (Landing vs Creator vs Vault vs Client Preview) */}
        <nav className={`flex items-center p-1 rounded-xl border text-xs ${pillClass}`}>
          <button
            onClick={() => setActiveTab('landing')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all font-medium ${
              activeTab === 'landing' ? 'bg-blue-600 text-white shadow-sm' : 'hover:opacity-100 opacity-80'
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span>Inicio</span>
          </button>

          <button
            onClick={() => setActiveTab('creator')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all font-medium ${
              activeTab === 'creator' ? 'bg-blue-600 text-white shadow-sm' : 'hover:opacity-100 opacity-80'
            }`}
          >
            <PenTool className="w-3.5 h-3.5" />
            <span>Creador (Split-Pane)</span>
          </button>

          <button
            onClick={() => setActiveTab('client-review')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all font-medium ${
              activeTab === 'client-review' ? 'bg-amber-600 text-white shadow-sm' : 'text-amber-500 hover:opacity-100 opacity-80'
            }`}
            title="Simular cómo el cliente recibe y negocia el contrato"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Simulador Cliente</span>
          </button>

          <button
            onClick={() => setActiveTab('vault')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all font-medium ${
              activeTab === 'vault' ? 'bg-blue-600 text-white shadow-sm' : 'hover:opacity-100 opacity-80'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Bóveda</span>
          </button>
        </nav>

        {/* Dual Language & Accessibility Controls */}
        <div className="flex items-center gap-2">
          {/* Dual Language Switch */}
          <div className={`flex items-center border rounded-xl p-0.5 text-xs ${pillClass}`}>
            <button
              onClick={() => store.setPreviewMode('human')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all ${
                store.previewMode === 'human' ? 'bg-blue-600 text-white font-semibold' : 'opacity-70 hover:opacity-100'
              }`}
              title="Vista Humana: Sin tecnicismos jurídicos"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Humana</span>
            </button>
            <button
              onClick={() => store.setPreviewMode('legal')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all ${
                store.previewMode === 'legal' ? 'bg-indigo-600 text-white font-semibold' : 'opacity-70 hover:opacity-100'
              }`}
              title="Vista Jurídica: Cláusulas formales del Código de Comercio"
            >
              <Scale className="w-3.5 h-3.5" />
              <span>Jurídica</span>
            </button>
          </div>

          {/* Theme Selector (Midnight, Warm, Contrast) */}
          <div className={`flex items-center border rounded-xl p-0.5 text-xs ${pillClass}`}>
            <button
              onClick={() => setTheme('midnight')}
              className={`px-2 py-1 rounded-lg transition-all ${theme === 'midnight' ? 'bg-slate-800 text-white shadow-sm font-bold' : 'opacity-70 hover:opacity-100'}`}
              title="Tema Medianoche (Oscuro)"
            >
              🌙
            </button>
            <button
              onClick={() => setTheme('warm')}
              className={`px-2 py-1 rounded-lg transition-all ${theme === 'warm' ? 'bg-[#D6C7B7] text-stone-900 shadow-sm font-bold' : 'opacity-70 hover:opacity-100'}`}
              title="Tema Papel Cálido (Lectura Sepia)"
            >
              📜
            </button>
            <button
              onClick={() => setTheme('contrast')}
              className={`px-2 py-1 rounded-lg transition-all ${theme === 'contrast' ? 'bg-yellow-400 text-black shadow-sm font-extrabold' : 'opacity-70 hover:opacity-100'}`}
              title="Alto Contraste WCAG AAA"
            >
              ⚡
            </button>
          </div>

          {/* Text Scaler - Enhanced Visibility */}
          <div className={`flex items-center border rounded-xl p-0.5 text-xs ${pillClass}`}>
            <button
              onClick={() => setFontScale(Math.max(85, fontScale - 10))}
              className="px-2 py-1 font-bold hover:bg-black/10 dark:hover:bg-white/10 rounded transition-colors"
              title="Disminuir tamaño de letra"
            >
              A-
            </button>
            <span className="text-[11px] font-mono px-1.5 opacity-80">{fontScale}%</span>
            <button
              onClick={() => setFontScale(Math.min(130, fontScale + 10))}
              className="px-2 py-1 font-bold hover:bg-black/10 dark:hover:bg-white/10 rounded transition-colors"
              title="Aumentar tamaño de letra"
            >
              A+
            </button>
          </div>
        </div>
      </header>

      {/* =========================================================================
          TAB 1: INTRODUCTORY LANDING PAGE / ONBOARDING EXPERIENCE
      ========================================================================== */}
      {activeTab === 'landing' && (
        <section className="flex-1 flex flex-col justify-center items-center px-4 py-12 max-w-5xl mx-auto space-y-12 animate-fadeIn">
          
          {/* Hero Banner */}
          <div className="text-center space-y-5 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-500 text-xs font-semibold">
              <Zap className="w-3.5 h-3.5" />
              <span>LegalTech Bilateral para Freelancers & Clientes en México, LATAM y Europa</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
              Acuerdos que blindan tu <span className="bg-gradient-to-r from-blue-500 via-indigo-400 to-teal-400 bg-clip-text text-transparent">tiempo, tu dinero y tus derechos</span> en 5 minutos.
            </h1>

            <p className="text-sm sm:text-base opacity-80 max-w-2xl mx-auto leading-relaxed">
              Pactio elimina la fricción de los contratos tradicionales: traducción instantánea a <strong>lenguaje ciudadano</strong>, anticipo obligatorio del 50%, retención de propiedad intelectual (Art. 83 LFDA), soporte multi-moneda (MXN, USD, EUR) y validez jurídica probatoria con <strong>sello de tiempo NOM-151 oficial</strong>.
            </p>

            <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => {
                  setActiveTab('creator');
                  setCurrentStep(1);
                }}
                className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-blue-500/25 transition-all duration-200 hover:scale-105 flex items-center gap-2"
              >
                <PenTool className="w-4 h-4" />
                <span>Crear Nuevo Acuerdo (Split-Pane)</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => setActiveTab('client-review')}
                className="px-6 py-3.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border border-amber-500/30 font-bold text-sm transition-all duration-200 flex items-center gap-2"
              >
                <Sliders className="w-4 h-4" />
                <span>Simular Experiencia del Cliente</span>
              </button>

              <button
                onClick={() => setActiveTab('vault')}
                className={`px-5 py-3.5 rounded-xl border ${pillClass} font-semibold text-sm hover:opacity-100 transition-all flex items-center gap-2`}
              >
                <BookOpen className="w-4 h-4" />
                <span>Abrir Bóveda</span>
              </button>
            </div>
          </div>

          {/* 3 Pillars / Value Proposition Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
            <div className={`p-6 rounded-2xl border ${panelBg} space-y-3 hover:scale-[1.02] transition-all duration-200`}>
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold">
                1
              </div>
              <h3 className="font-bold text-base">Traducción Ciudadana Dual</h3>
              <p className="text-xs opacity-75 leading-relaxed">
                El cliente y tú ven el mismo acuerdo en dos idiomas: <em>Vista Humana</em> (sin letras chiquitas ni jerga latina) o <em>Vista Jurídica</em> formal para el SAT y tribunales mercantiles.
              </p>
            </div>

            <div className={`p-6 rounded-2xl border ${panelBg} space-y-3 hover:scale-[1.02] transition-all duration-200`}>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">
                2
              </div>
              <h3 className="font-bold text-base">Anticipo & Blindaje LFDA</h3>
              <p className="text-xs opacity-75 leading-relaxed">
                Regla de oro: 50% de anticipo para arrancar. Los derechos de tus diseños y código se transfieren <strong>únicamente tras el pago del 100%</strong> (Art. 83 Ley Federal del Derecho de Autor).
              </p>
            </div>

            <div className={`p-6 rounded-2xl border ${panelBg} space-y-3 hover:scale-[1.02] transition-all duration-200`}>
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-bold">
                3
              </div>
              <h3 className="font-bold text-base">Estampa Oficial NOM-151</h3>
              <p className="text-xs opacity-75 leading-relaxed">
                Sello criptográfico SHA-256 sincronizado con el reloj atómico del CENAM a través de Prestador de Servicios de Certificación (PSC). Fecha cierta inmutable e indiscutible.
              </p>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className={`w-full p-6 rounded-2xl border ${pillClass} flex flex-wrap items-center justify-around gap-6 text-center text-xs`}>
            <div>
              <span className="block text-xl font-bold font-mono text-blue-500">0%</span>
              <span className="opacity-70">Comisiones de plataforma leoninas</span>
            </div>
            <div>
              <span className="block text-xl font-bold font-mono text-emerald-500">100%</span>
              <span className="opacity-70">Blindaje de derechos patrimoniales</span>
            </div>
            <div>
              <span className="block text-xl font-bold font-mono text-indigo-500">NOM-151</span>
              <span className="opacity-70">Validez plena en Código de Comercio</span>
            </div>
            <div>
              <span className="block text-xl font-bold font-mono text-amber-500">&lt; 5 min</span>
              <span className="opacity-70">Para formalizar y firmar</span>
            </div>
          </div>
        </section>
      )}

      {/* =========================================================================
          TAB 2: CREATOR SPLIT-PANE WIZARD & LIVE COMPILED DOCUMENT
      ========================================================================== */}
      {activeTab === 'creator' && (
        <main className="flex-1 flex flex-col lg:flex-row w-full max-w-[1700px] mx-auto overflow-hidden">
          
          {/* -------------------------------------------------------------
              LEFT PANEL: 5-STEP WIZARD (52% ON DESKTOP)
          -------------------------------------------------------------- */}
          <div className={`w-full lg:w-[52%] flex flex-col border-r ${panelBg} overflow-y-auto`}>
            
            {/* Stepper Header */}
            <div className={`sticky top-0 z-20 border-b p-4 backdrop-blur-md ${headerBg}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs uppercase font-mono tracking-wider text-blue-500 font-bold">
                  Paso {currentStep} de 5 · {
                    currentStep === 1 ? 'Partes & Identidad' :
                    currentStep === 2 ? 'Alcance & Entregables' :
                    currentStep === 3 ? 'Cobro & Hitos de Pago' :
                    currentStep === 4 ? 'Propiedad Intelectual (LFDA)' :
                    'Gobernanza & Salida'
                  }
                </span>
                <div className="flex items-center gap-1.5 text-xs opacity-75">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>Guardado reactivo</span>
                </div>
              </div>

              {/* Stepper Progress Bar */}
              <div className="grid grid-cols-5 gap-1.5">
                {[1, 2, 3, 4, 5].map((step) => (
                  <button
                    key={step}
                    onClick={() => setCurrentStep(step)}
                    className={`h-2 rounded-full transition-all duration-200 ${
                      currentStep === step
                        ? 'bg-blue-600 shadow-sm shadow-blue-500/50'
                        : currentStep > step
                        ? 'bg-emerald-500'
                        : 'bg-slate-300 dark:bg-slate-700'
                    }`}
                    title={`Ir al Paso ${step}`}
                  />
                ))}
              </div>
            </div>

            {/* Stepper Content Form */}
            <div className="p-6 lg:p-8 space-y-6 flex-1">
              
              {/* STEP 1: PARTIES */}
              {currentStep === 1 && (
                <div className="space-y-6 animate-fadeIn">
                  <div>
                    <h2 className="text-xl font-bold flex items-center gap-2">
                      <span>¿Quiénes celebran el acuerdo?</span>
                      <button
                        onClick={() => setActiveTooltip(activeTooltip === 'parties' ? null : 'parties')}
                        className="opacity-60 hover:opacity-100 hover:text-blue-500 transition-opacity"
                        title="Ayuda didáctica"
                      >
                        <HelpCircle className="w-4 h-4" />
                      </button>
                    </h2>
                    {activeTooltip === 'parties' && (
                      <div className={`p-3 my-2 text-xs rounded-xl border ${infoBoxClass}`}>
                        <p className="font-semibold text-blue-500">💡 Tip de Materialidad Fiscal (SAT & LATAM):</p>
                        <p>Los RFCs válidos y domicilios fiscales reales son indispensables para que tu factura sea 100% deducible y cumpla con el Artículo 69-B del CFF.</p>
                      </div>
                    )}
                  </div>

                  {/* Creator Card */}
                  <div className={`p-5 rounded-2xl border ${infoBoxClass} space-y-4`}>
                    <div className="flex items-center gap-2 font-bold text-sm">
                      <User className="w-4 h-4 text-blue-500" />
                      <span>Datos del Prestador (Tú como Creador)</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className={labelClass}>Nombre legal completo</label>
                        <input
                          type="text"
                          value={store.parties.creator.legalName}
                          onChange={(e) => store.updateCreator({ legalName: e.target.value })}
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>RFC con Homoclave (SAT / Tax ID)</label>
                        <input
                          type="text"
                          value={store.parties.creator.rfc}
                          onChange={(e) => store.updateCreator({ rfc: e.target.value.toUpperCase() })}
                          className={`${inputClass} font-mono`}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Nombre Comercial o Estudio</label>
                        <input
                          type="text"
                          value={store.parties.creator.commercialName || ''}
                          onChange={(e) => store.updateCreator({ commercialName: e.target.value })}
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Correo electrónico fiscal</label>
                        <input
                          type="email"
                          value={store.parties.creator.email}
                          onChange={(e) => store.updateCreator({ email: e.target.value })}
                          className={inputClass}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Client Card */}
                  <div className={`p-5 rounded-2xl border ${infoBoxClass} space-y-4`}>
                    <div className="flex items-center gap-2 font-bold text-sm">
                      <Users className="w-4 h-4 text-emerald-500" />
                      <span>Datos de tu Cliente (Empresa o Persona)</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className={labelClass}>Razón Social o Nombre del Cliente</label>
                        <input
                          type="text"
                          value={store.parties.client.legalName}
                          onChange={(e) => store.updateClient({ legalName: e.target.value })}
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>RFC / Tax ID del Cliente</label>
                        <input
                          type="text"
                          value={store.parties.client.rfc}
                          onChange={(e) => store.updateClient({ rfc: e.target.value.toUpperCase() })}
                          className={`${inputClass} font-mono`}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Nombre Comercial</label>
                        <input
                          type="text"
                          value={store.parties.client.commercialName || ''}
                          onChange={(e) => store.updateClient({ commercialName: e.target.value })}
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Correo de contacto</label>
                        <input
                          type="email"
                          value={store.parties.client.email}
                          onChange={(e) => store.updateClient({ email: e.target.value })}
                          className={inputClass}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: SCOPE & DELIVERABLES */}
              {currentStep === 2 && (
                <div className="space-y-6 animate-fadeIn">
                  <div>
                    <h2 className="text-xl font-bold flex items-center gap-2">
                      <span>¿Qué vas a entregar exactamente?</span>
                      <button
                        onClick={() => setActiveTooltip(activeTooltip === 'scope' ? null : 'scope')}
                        className="opacity-60 hover:opacity-100 hover:text-blue-500 transition-opacity"
                        title="Ayuda didáctica"
                      >
                        <HelpCircle className="w-4 h-4" />
                      </button>
                    </h2>
                    {activeTooltip === 'scope' && (
                      <div className={`p-3 my-2 text-xs rounded-xl border ${infoBoxClass}`}>
                        <p className="font-semibold text-blue-500">💡 Cómo blindar el Scope Creep:</p>
                        <p>Delimitar claramente lo que incluye y lo que NO incluye protege tu tiempo y te da base legal para cobrar adicionales.</p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className={labelClass}>Título del proyecto</label>
                      <input
                        type="text"
                        value={store.scope.projectTitle}
                        onChange={(e) => store.updateScope({ projectTitle: e.target.value })}
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label className={labelClass}>Descripción del alcance detallado</label>
                      <textarea
                        rows={3}
                        value={store.scope.description}
                        onChange={(e) => store.updateScope({ description: e.target.value })}
                        className={inputClass}
                      />
                    </div>

                    {/* Insumos Previos Callout */}
                    <div className={infoBoxClass}>
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
              )}

              {/* STEP 3: PAYMENTS, MILESTONES & CURRENCY (EUR / USD / MXN) */}
              {currentStep === 3 && (
                <div className="space-y-6 animate-fadeIn">
                  <div>
                    <h2 className="text-xl font-bold flex items-center gap-2">
                      <span>¿Cuánto y cómo se va a cobrar?</span>
                      <button
                        onClick={() => setActiveTooltip(activeTooltip === 'milestones' ? null : 'milestones')}
                        className="opacity-60 hover:opacity-100 hover:text-blue-500 transition-opacity"
                        title="Ayuda didáctica"
                      >
                        <HelpCircle className="w-4 h-4" />
                      </button>
                    </h2>
                    {activeTooltip === 'milestones' && (
                      <div className={`p-3 my-2 text-xs rounded-xl border ${infoBoxClass}`}>
                        <p className="font-semibold text-blue-500">💡 La Regla de Oro del Anticipo:</p>
                        <p>Trabajar sin anticipo es el riesgo #1 para cualquier profesional. Pactio estructura modelos seguros para blindar tu tiempo y finanzas desde el día cero.</p>
                      </div>
                    )}
                  </div>

                  {/* Total Amount & Currency Selector (MXN, USD, EUR) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Monto total del proyecto</label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-3 text-sm opacity-60 font-mono">{currencySymbol}</span>
                        <input
                          type="number"
                          step="1000"
                          min="0"
                          value={store.payments.totalAmountCents / 100}
                          onChange={(e) => {
                            const val = Math.max(0, parseFloat(e.target.value) || 0) * 100;
                            store.updatePayments({ totalAmountCents: Math.round(val) });
                          }}
                          className={`${inputClass} pl-8 font-mono font-bold text-base`}
                        />
                      </div>
                    </div>

                    <div>
                      <label className={labelClass}>Moneda contractual</label>
                      <select
                        value={store.payments.currency}
                        onChange={(e) => store.updatePayments({ currency: e.target.value as 'MXN' | 'USD' | 'EUR' })}
                        className={selectClass}
                        style={{ colorScheme: theme === 'warm' ? 'light' : 'dark' }}
                      >
                        <option value="MXN" className={optionClass} style={{ backgroundColor: theme === 'warm' ? '#ffffff' : '#0B1120', color: theme === 'warm' ? '#1C1917' : '#F8FAFC' }}>MXN ($ Pesos Mexicanos)</option>
                        <option value="USD" className={optionClass} style={{ backgroundColor: theme === 'warm' ? '#ffffff' : '#0B1120', color: theme === 'warm' ? '#1C1917' : '#F8FAFC' }}>USD ($ Dólares Americanos)</option>
                        <option value="EUR" className={optionClass} style={{ backgroundColor: theme === 'warm' ? '#ffffff' : '#0B1120', color: theme === 'warm' ? '#1C1917' : '#F8FAFC' }}>EUR (€ Euros Unión Europea)</option>
                      </select>
                    </div>
                  </div>

                  {/* Payment Model Presets */}
                  <div className="space-y-2">
                    <label className={labelClass}>Modelo de Distribución de Pagos</label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                      <button
                        onClick={() => store.applyPaymentPreset('fixed_50_50')}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          store.payments.milestones.length === 2 && store.payments.milestones[0].percentage === 50
                            ? 'bg-blue-600 text-white font-bold border-blue-500 shadow-sm'
                            : `${pillClass} hover:border-blue-400`
                        }`}
                      >
                        <span className="block font-bold">50% / 50% Estándar</span>
                        <span className="text-[11px] opacity-80">Anticipo + Finiquito (Recomendado)</span>
                      </button>

                      <button
                        onClick={() => store.applyPaymentPreset('milestones_3')}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          store.payments.milestones.length === 3
                            ? 'bg-blue-600 text-white font-bold border-blue-500 shadow-sm'
                            : `${pillClass} hover:border-blue-400`
                        }`}
                      >
                        <span className="block font-bold">30% / 40% / 30% Hitos</span>
                        <span className="text-[11px] opacity-80">Proyectos Medianos & Wireframes</span>
                      </button>

                      <button
                        onClick={() => store.applyPaymentPreset('full_advance')}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          store.payments.milestones.length === 1 && store.payments.milestones[0].percentage === 100
                            ? 'bg-blue-600 text-white font-bold border-blue-500 shadow-sm'
                            : `${pillClass} hover:border-blue-400`
                        }`}
                      >
                        <span className="block font-bold">100% Anticipo Express</span>
                        <span className="text-[11px] opacity-80">Sprints cortos & Auditorías</span>
                      </button>
                    </div>
                  </div>

                  {/* Interactive Milestones Editor */}
                  <div className={`p-5 rounded-2xl border ${infoBoxClass} space-y-4`}>
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">Hitos de Pago ({store.payments.milestones.length})</span>
                        {isPercentBalanced ? (
                          <span className="text-emerald-500 font-bold font-mono text-[11px] bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                            ✓ 100% Balanceado
                          </span>
                        ) : (
                          <span className="text-amber-500 font-bold font-mono text-[11px] bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/30 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            {milestonesPercentSum}% total (desbalanceado)
                          </span>
                        )}
                      </div>

                      {!isPercentBalanced && (
                        <button
                          onClick={handleAutoBalance}
                          className="text-xs text-blue-500 font-bold hover:underline"
                        >
                          Auto-Equilibrar a 100%
                        </button>
                      )}
                    </div>

                    {/* Visual Distribution Bar */}
                    <div className="w-full h-3.5 bg-slate-200 dark:bg-slate-800 rounded-full flex overflow-hidden shadow-inner">
                      {store.payments.milestones.map((m, idx) => {
                        const colors = ['bg-blue-600', 'bg-emerald-600', 'bg-indigo-600', 'bg-amber-600'];
                        return (
                          <div
                            key={m.id}
                            style={{ width: `${m.percentage}%` }}
                            className={`${colors[idx % colors.length]} h-full flex items-center justify-center text-[9px] font-bold text-white transition-all`}
                            title={`${m.title}: ${m.percentage}%`}
                          >
                            {m.percentage > 12 ? `${m.percentage}%` : ''}
                          </div>
                        );
                      })}
                    </div>

                    {/* Milestones Dynamic List */}
                    <div className="space-y-3 pt-2">
                      {store.payments.milestones.map((m, idx) => (
                        <div key={m.id} className={`p-3.5 rounded-xl border ${pillClass} space-y-2`}>
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex-1">
                              <span className="text-[10px] font-bold text-blue-500 uppercase font-mono block">
                                Hito {idx + 1}
                              </span>
                              <input
                                type="text"
                                value={m.title}
                                onChange={(e) => store.updateMilestone(m.id, { title: e.target.value })}
                                className="w-full bg-transparent font-bold text-xs focus:outline-none border-b border-transparent hover:border-slate-400 focus:border-blue-500"
                              />
                            </div>

                            <div className="flex items-center gap-3">
                              {/* Percentage input */}
                              <div className="flex items-center gap-1">
                                <input
                                  type="number"
                                  min="1"
                                  max="100"
                                  value={m.percentage}
                                  onChange={(e) => {
                                    const p = Math.max(1, Math.min(100, parseInt(e.target.value) || 0));
                                    const amt = Math.round((store.payments.totalAmountCents * p) / 100);
                                    store.updateMilestone(m.id, { percentage: p, amountCents: amt });
                                  }}
                                  className="w-14 px-2 py-1 bg-black/10 dark:bg-white/10 rounded font-mono text-xs font-bold text-center focus:outline-none"
                                />
                                <span className="text-xs font-mono font-bold">%</span>
                              </div>

                              {/* Amount Display */}
                              <span className="text-xs font-mono font-bold text-blue-500 min-w-24 text-right">
                                {currencySymbol}{((m.amountCents) / 100).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                              </span>

                              {/* Remove milestone button */}
                              {store.payments.milestones.length > 1 && (
                                <button
                                  onClick={() => store.removeMilestone(m.id)}
                                  className="text-red-400 hover:text-red-500 p-1 opacity-70 hover:opacity-100"
                                  title="Eliminar hito"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* Add Milestone Button */}
                      <button
                        onClick={handleAddMilestone}
                        className="w-full py-2 border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 rounded-xl text-xs font-bold text-blue-500 flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Añadir Hito Personalizado</span>
                      </button>
                    </div>
                  </div>

                  {/* Payment Method Details (SPEI / Stripe / Wise) */}
                  <div className={`p-4 rounded-xl border ${infoBoxClass} space-y-3`}>
                    <label className={labelClass}>Canal de Cobro Preferido</label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                      <button
                        onClick={() => setPaymentMethod('spei')}
                        className={`p-2.5 rounded-lg border flex items-center gap-2 font-medium ${
                          paymentMethod === 'spei' ? 'bg-blue-600 text-white font-bold' : `${pillClass}`
                        }`}
                      >
                        <Landmark className="w-4 h-4" />
                        <span>SPEI / CLABE (MX)</span>
                      </button>

                      <button
                        onClick={() => setPaymentMethod('stripe')}
                        className={`p-2.5 rounded-lg border flex items-center gap-2 font-medium ${
                          paymentMethod === 'stripe' ? 'bg-blue-600 text-white font-bold' : `${pillClass}`
                        }`}
                      >
                        <CreditCard className="w-4 h-4" />
                        <span>Tarjeta / Stripe</span>
                      </button>

                      <button
                        onClick={() => setPaymentMethod('wise')}
                        className={`p-2.5 rounded-lg border flex items-center gap-2 font-medium ${
                          paymentMethod === 'wise' ? 'bg-blue-600 text-white font-bold' : `${pillClass}`
                        }`}
                      >
                        <Globe className="w-4 h-4" />
                        <span>Wise / IBAN (EUR/USD)</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: INTELLECTUAL PROPERTY & RIGHTS (EXPANDED & DETAILED) */}
              {currentStep === 4 && (
                <div className="space-y-6 animate-fadeIn">
                  <div>
                    <h2 className="text-xl font-bold flex items-center gap-2">
                      <span>Propiedad Intelectual, Derechos & Confidencialidad</span>
                      <button
                        onClick={() => setActiveTooltip(activeTooltip === 'ip' ? null : 'ip')}
                        className="opacity-60 hover:opacity-100 hover:text-blue-500 transition-opacity"
                        title="Ayuda didáctica"
                      >
                        <HelpCircle className="w-4 h-4" />
                      </button>
                    </h2>
                    {activeTooltip === 'ip' && (
                      <div className={`p-3 my-2 text-xs rounded-xl border ${infoBoxClass}`}>
                        <p className="font-semibold text-blue-500">💡 Artículo 83 de la LFDA:</p>
                        <p>En obras por encargo, los derechos patrimoniales pertenecen al creador hasta que se pague el 100%. Pactio hace que este candado sea inamovible para protegerte de clientes que reciben el trabajo y no pagan el finiquito.</p>
                      </div>
                    )}
                  </div>

                  {/* 1. Golden Lock: Reserva de Dominio (Pago 100%) */}
                  <div className={ipBannerClass}>
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
                  <div className={`p-4 rounded-xl border flex items-center justify-between ${pillClass} hover:border-blue-400 transition-all`}>
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
                      checked={store.intellectualProperty.retainCreatorBackgroundIP}
                      onChange={(e) => store.updateIP({ retainCreatorBackgroundIP: e.target.checked })}
                      className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500 cursor-pointer shrink-0 ml-3"
                    />
                  </div>

                  {/* 3. Moral Rights (Art. 21 LFDA) */}
                  <div className={`p-4 rounded-xl border ${pillClass} space-y-1`}>
                    <div className="flex items-center gap-1.5 font-bold text-xs text-indigo-400">
                      <Award className="w-4 h-4 shrink-0" />
                      <span>3. Derechos Morales Irrenunciables (Crédito de Autoría)</span>
                    </div>
                    <p className="text-[11px] opacity-80 leading-relaxed">
                      El Artículo 21 de la LFDA establece que el derecho a ser reconocido como autor original es inalienable, perpetuo e irrenunciable. El cliente no puede adjudicarse la autoría intelectual original.
                    </p>
                  </div>

                  {/* 4. Portfolio Showcase Rights */}
                  <div className={`p-4 rounded-xl border flex items-center justify-between ${pillClass} hover:border-blue-400 transition-all`}>
                    <div className="space-y-0.5 max-w-md">
                      <h4 className="text-xs font-bold">4. Derecho de Exhibición en Portafolio</h4>
                      <p className="text-[11px] opacity-80">
                        Te autoriza a mostrar el caso de estudio y capturas en tu sitio web, Behance, LinkedIn y presentaciones comerciales tras el lanzamiento público.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={store.intellectualProperty.creatorPortfolioRights}
                      onChange={(e) => store.updateIP({ creatorPortfolioRights: e.target.checked })}
                      className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500 cursor-pointer shrink-0 ml-3"
                    />
                  </div>

                  {/* 5. NDA / Confidentiality Agreement */}
                  <div className={`p-4 rounded-xl border ${pillClass} space-y-3`}>
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h4 className="text-xs font-bold">5. Acuerdo Bilateral de Confidencialidad (NDA)</h4>
                        <p className="text-[11px] opacity-80">Protección de secretos comerciales e información sensible compartida.</p>
                      </div>
                      <select
                        value={store.intellectualProperty.confidentialityDurationYears}
                        onChange={(e) => store.updateIP({ confidentialityDurationYears: parseInt(e.target.value) })}
                        className={inlineSelectClass}
                        style={{ colorScheme: theme === 'warm' ? 'light' : 'dark' }}
                      >
                        <option value={1} className={optionClass} style={{ backgroundColor: theme === 'warm' ? '#ffffff' : '#0B1120', color: theme === 'warm' ? '#1C1917' : '#F8FAFC' }}>Vigencia: 1 año</option>
                        <option value={2} className={optionClass} style={{ backgroundColor: theme === 'warm' ? '#ffffff' : '#0B1120', color: theme === 'warm' ? '#1C1917' : '#F8FAFC' }}>Vigencia: 2 años</option>
                        <option value={3} className={optionClass} style={{ backgroundColor: theme === 'warm' ? '#ffffff' : '#0B1120', color: theme === 'warm' ? '#1C1917' : '#F8FAFC' }}>Vigencia: 3 años (Estándar)</option>
                        <option value={5} className={optionClass} style={{ backgroundColor: theme === 'warm' ? '#ffffff' : '#0B1120', color: theme === 'warm' ? '#1C1917' : '#F8FAFC' }}>Vigencia: 5 años</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 5: GOVERNANCE, REVISIONS & EXIT RULES */}
              {currentStep === 5 && (
                <div className="space-y-6 animate-fadeIn">
                  <div>
                    <h2 className="text-xl font-bold flex items-center gap-2">
                      <span>Gobernanza y Reglas de Salida Limpia</span>
                      <button
                        onClick={() => setActiveTooltip(activeTooltip === 'gov' ? null : 'gov')}
                        className="opacity-60 hover:opacity-100 hover:text-blue-500 transition-opacity"
                        title="Ayuda didáctica"
                      >
                        <HelpCircle className="w-4 h-4" />
                      </button>
                    </h2>
                    {activeTooltip === 'gov' && (
                      <div className={`p-3 my-2 text-xs rounded-xl border ${infoBoxClass}`}>
                        <p className="font-semibold text-blue-500">💡 Silencio Tácito:</p>
                        <p>El que calla otorga. Si el cliente no formula observaciones fundamentadas en los días hábiles acordados tras la entrega, el hito se tiene por aprobado tácitamente para liberar el pago.</p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    {/* Revision rounds */}
                    <div className={`p-4 rounded-xl border flex items-center justify-between ${pillClass}`}>
                      <div>
                        <h4 className="text-xs font-bold">Rondas de Ajustes Incluidas</h4>
                        <p className="text-[11px] opacity-75">Límite para evitar cambios infinitos y re-trabajo gratuito</p>
                      </div>
                      <select
                        value={store.governance.includedRevisionRounds}
                        onChange={(e) => store.updateGovernance({ includedRevisionRounds: parseInt(e.target.value) })}
                        className={inlineSelectClass}
                        style={{ colorScheme: theme === 'warm' ? 'light' : 'dark' }}
                      >
                        <option value={1} className={optionClass} style={{ backgroundColor: theme === 'warm' ? '#ffffff' : '#0B1120', color: theme === 'warm' ? '#1C1917' : '#F8FAFC' }}>1 ronda de ajustes</option>
                        <option value={2} className={optionClass} style={{ backgroundColor: theme === 'warm' ? '#ffffff' : '#0B1120', color: theme === 'warm' ? '#1C1917' : '#F8FAFC' }}>2 rondas (Estándar)</option>
                        <option value={3} className={optionClass} style={{ backgroundColor: theme === 'warm' ? '#ffffff' : '#0B1120', color: theme === 'warm' ? '#1C1917' : '#F8FAFC' }}>3 rondas</option>
                        <option value={4} className={optionClass} style={{ backgroundColor: theme === 'warm' ? '#ffffff' : '#0B1120', color: theme === 'warm' ? '#1C1917' : '#F8FAFC' }}>4 rondas</option>
                      </select>
                    </div>

                    {/* Tacit approval window */}
                    <div className={`p-4 rounded-xl border flex items-center justify-between ${pillClass}`}>
                      <div>
                        <h4 className="text-xs font-bold">Ventana de Aceptación Tácita</h4>
                        <p className="text-[11px] opacity-75">Días hábiles para revisar antes de aprobación automática</p>
                      </div>
                      <select
                        value={store.governance.tacitApprovalWindowDays}
                        onChange={(e) => store.updateGovernance({ tacitApprovalWindowDays: parseInt(e.target.value) })}
                        className={inlineSelectClass}
                        style={{ colorScheme: theme === 'warm' ? 'light' : 'dark' }}
                      >
                        <option value={3} className={optionClass} style={{ backgroundColor: theme === 'warm' ? '#ffffff' : '#0B1120', color: theme === 'warm' ? '#1C1917' : '#F8FAFC' }}>3 días hábiles</option>
                        <option value={5} className={optionClass} style={{ backgroundColor: theme === 'warm' ? '#ffffff' : '#0B1120', color: theme === 'warm' ? '#1C1917' : '#F8FAFC' }}>5 días hábiles (Recomendado)</option>
                        <option value={7} className={optionClass} style={{ backgroundColor: theme === 'warm' ? '#ffffff' : '#0B1120', color: theme === 'warm' ? '#1C1917' : '#F8FAFC' }}>7 días hábiles</option>
                        <option value={10} className={optionClass} style={{ backgroundColor: theme === 'warm' ? '#ffffff' : '#0B1120', color: theme === 'warm' ? '#1C1917' : '#F8FAFC' }}>10 días hábiles</option>
                      </select>
                    </div>

                    {/* Kill Fee */}
                    <div className={`p-4 rounded-xl border flex items-center justify-between ${pillClass}`}>
                      <div>
                        <h4 className="text-xs font-bold">Salida Limpia (Kill Fee)</h4>
                        <p className="text-[11px] opacity-75">Compensación justa si el cliente cancela unilateralmente</p>
                      </div>
                      <select
                        value={store.governance.killFeePercentage}
                        onChange={(e) => store.updateGovernance({ killFeePercentage: parseInt(e.target.value) })}
                        className={inlineSelectClass}
                        style={{ colorScheme: theme === 'warm' ? 'light' : 'dark' }}
                      >
                        <option value={30} className={optionClass} style={{ backgroundColor: theme === 'warm' ? '#ffffff' : '#0B1120', color: theme === 'warm' ? '#1C1917' : '#F8FAFC' }}>30% retenido</option>
                        <option value={50} className={optionClass} style={{ backgroundColor: theme === 'warm' ? '#ffffff' : '#0B1120', color: theme === 'warm' ? '#1C1917' : '#F8FAFC' }}>50% retenido (Estándar)</option>
                        <option value={70} className={optionClass} style={{ backgroundColor: theme === 'warm' ? '#ffffff' : '#0B1120', color: theme === 'warm' ? '#1C1917' : '#F8FAFC' }}>70% retenido</option>
                      </select>
                    </div>

                    {/* Dispute Resolution Method */}
                    <div className={`p-4 rounded-xl border flex items-center justify-between ${pillClass}`}>
                      <div>
                        <h4 className="text-xs font-bold">Resolución de Controversias</h4>
                        <p className="text-[11px] opacity-75">Vía pactada para resolver cualquier diferendo legal</p>
                      </div>
                      <select
                        value={store.governance.disputeResolutionMethod}
                        onChange={(e) => store.updateGovernance({ disputeResolutionMethod: e.target.value as any })}
                        className={inlineSelectClass}
                        style={{ colorScheme: theme === 'warm' ? 'light' : 'dark' }}
                      >
                        <option value="amicable_negotiation" className={optionClass} style={{ backgroundColor: theme === 'warm' ? '#ffffff' : '#0B1120', color: theme === 'warm' ? '#1C1917' : '#F8FAFC' }}>Negociación Amistosa Bilateral (30 días)</option>
                        <option value="arbitration" className={optionClass} style={{ backgroundColor: theme === 'warm' ? '#ffffff' : '#0B1120', color: theme === 'warm' ? '#1C1917' : '#F8FAFC' }}>Arbitraje Comercial Privado (CAM)</option>
                        <option value="ordinary_courts" className={optionClass} style={{ backgroundColor: theme === 'warm' ? '#ffffff' : '#0B1120', color: theme === 'warm' ? '#1C1917' : '#F8FAFC' }}>Tribunales Mercantiles Ordinarios</option>
                      </select>
                    </div>

                    {/* Jurisdiction City & State Inputs */}
                    <div className={`p-4 rounded-xl border ${pillClass} space-y-3`}>
                      <div>
                        <h4 className="text-xs font-bold">Jurisdicción y Tribunales Competentes</h4>
                        <p className="text-[11px] opacity-75">Ciudad y Estado sede para validez legal e interpretación</p>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] opacity-75 block mb-1">Ciudad</label>
                          <input
                            type="text"
                            value={store.governance.jurisdiction.city}
                            onChange={(e) => store.updateGovernance({
                              jurisdiction: { ...store.governance.jurisdiction, city: e.target.value }
                            })}
                            className={inputClass}
                            placeholder="Ej. Ciudad de México"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] opacity-75 block mb-1">Estado / Región</label>
                          <input
                            type="text"
                            value={store.governance.jurisdiction.state}
                            onChange={(e) => store.updateGovernance({
                              jurisdiction: { ...store.governance.jurisdiction, state: e.target.value }
                            })}
                            className={inputClass}
                            placeholder="Ej. CDMX"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Wizard Bottom Controls */}
            <div className={`sticky bottom-0 z-20 border-t p-4 flex items-center justify-between backdrop-blur-md ${headerBg}`}>
              <button
                disabled={currentStep === 1}
                onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold opacity-70 hover:opacity-100 disabled:opacity-30 transition-opacity"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Anterior</span>
              </button>

              <div className="flex items-center gap-2">
                {currentStep < 5 ? (
                  <button
                    onClick={() => setCurrentStep(Math.min(5, currentStep + 1))}
                    className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/25 transition-all hover:scale-105"
                  >
                    <span>Siguiente paso</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={openSignatureModal}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white text-xs font-bold shadow-lg shadow-emerald-500/25 transition-all hover:scale-105 animate-pulse"
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
          <div className={previewBackdropClass}>
            
            {/* Quick Actions Bar above document */}
            <div className="w-full max-w-[760px] mb-3 flex items-center justify-between text-xs px-1">
              <span className="opacity-75 font-mono text-[11px]">
                {store.previewMode === 'human' ? 'Vista Humana Ciudadana' : 'Vista Jurídica Canónica'}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg border text-xs font-medium ${pillClass} hover:opacity-100 transition-opacity`}
                  title="Imprimir documento oficial en hoja membretada A4/Carta"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimir / PDF</span>
                </button>
                <button
                  onClick={downloadContractMarkdown}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg border text-xs font-medium ${pillClass} hover:opacity-100 transition-opacity`}
                  title="Descargar archivo Markdown (.md) canónico"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Descargar .MD</span>
                </button>
              </div>
            </div>

            {/* The Paper Sheet */}
            <div className={`w-full max-w-[760px] p-8 lg:p-12 rounded-2xl transition-all duration-300 print-document ${paperClasses}`}>
              
              {/* Document Header */}
              <div className="border-b border-slate-200 dark:border-stone-200 pb-6 mb-6 flex items-start justify-between">
                <div>
                  <span className="text-[11px] font-mono tracking-widest text-slate-500 uppercase block mb-1">
                    DOCUMENTO OFICIAL PACTIO · ID: {store.contractCode}
                  </span>
                  <h1 className="text-xl lg:text-2xl font-serif font-bold tracking-tight text-slate-900">
                    CONTRATO DE PRESTACIÓN DE SERVICIOS DIGITALES
                  </h1>
                  <p className="text-xs text-slate-500 mt-1">
                    Celebrado con fundamento en los Artículos 89 al 95 del Código de Comercio y NOM-151-SCFI-2016
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 shadow-sm shrink-0">
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
                      <h4 className="text-base font-bold text-slate-900 mt-1">
                        {currencySymbol}{(store.payments.totalAmountCents / 100).toLocaleString('es-MX', { minimumFractionDigits: 2 })} {store.payments.currency}
                      </h4>
                      <p className="text-xs text-slate-600 mt-1">
                        Dividido en {store.payments.milestones.length} hito(s) de pago vinculantes.
                      </p>
                    </div>

                    {/* Box 4: Cambios */}
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-[10px] font-bold text-indigo-600 uppercase font-mono tracking-wider">4. ¿Y si necesitas cambios?</span>
                      <h4 className="text-sm font-bold text-slate-900 mt-1">{store.governance.includedRevisionRounds} Rondas de Ajustes Incluidas</h4>
                      <p className="text-xs text-slate-600 mt-1">Tienes {store.governance.tacitApprovalWindowDays} días hábiles para revisar cada hito; ajustes extra se cotizan aparte.</p>
                    </div>
                  </div>

                  {/* Golden Rule Banner */}
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
                    <Lock className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-emerald-950">Garantía Bilateral de Propiedad Intelectual</h4>
                      <p className="text-xs text-emerald-900 mt-0.5 leading-relaxed">
                        Los archivos y derechos son tuyos en cuanto se liquide el 100% del pago pactado. Ambas partes protegidas sin ambigüedades conforme al Art. 83 LFDA.
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
                      II. Declara <strong>{store.parties.client.legalName}</strong> con RFC <strong>{store.parties.client.rfc}</strong> estar interesada en contratar los servicios del Prestador bajo los términos estipulados...
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
                      <p className="text-xs mt-1 text-slate-700">
                        El Cliente pagará la cantidad total de <strong>{currencySymbol}{(store.payments.totalAmountCents / 100).toLocaleString('es-MX', { minimumFractionDigits: 2 })} {store.payments.currency}</strong> distribuida en los hitos pactados.
                      </p>
                    </div>

                    <div className="p-3 rounded-lg border border-emerald-200 bg-emerald-50/60">
                      <h4 className="font-bold text-xs font-sans text-emerald-950">TERCERA. RESERVA DE DERECHOS PATRIMONIALES (ART. 83 LFDA)</h4>
                      <p className="text-xs mt-1 text-emerald-950">
                        La transmisión de derechos patrimoniales sobre los entregables queda expresamente sujeta a la <strong>condición suspensiva de liquidación del 100% de la contraprestación</strong> pactada.
                      </p>
                    </div>

                    <div className="p-3 rounded-lg border border-transparent hover:border-blue-200 transition-colors">
                      <h4 className="font-bold text-xs font-sans text-slate-900">CUARTA. APROBACIÓN TÁCITA POR SILENCIO</h4>
                      <p className="text-xs mt-1 text-slate-700">El Cliente contará con un plazo de <strong>{store.governance.tacitApprovalWindowDays} días hábiles</strong> posteriores a cada entrega para formular observaciones fundamentadas; fenecido dicho plazo sin notificación, se tendrá por tácitamente aprobado el hito.</p>
                    </div>
                  </section>

                  {/* Legal Stamp Footer */}
                  <div className="pt-6 border-t border-slate-200 mt-8 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 font-sans relative">
                    <div className="flex items-center gap-2">
                      <span>Hash canónico: <code className="font-mono text-blue-600 bg-blue-50 px-1 py-0.5 rounded">{store.cachedDocumentHash.substring(0, 16)}...</code></span>
                      <button
                        onClick={() => setShowAuditInspector(!showAuditInspector)}
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
                      <div className="absolute bottom-10 left-0 right-0 z-30 p-4 rounded-xl bg-slate-900 text-white shadow-2xl border border-slate-700 space-y-2 animate-scaleUp text-xs font-sans">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                          <span className="font-bold flex items-center gap-1.5 text-blue-400">
                            <Shield className="w-4 h-4" />
                            <span>Auditor Criptográfico SHA-256 en Vivo</span>
                          </span>
                          <button onClick={() => setShowAuditInspector(false)} className="text-slate-400 hover:text-white cursor-pointer">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="space-y-1 font-mono text-[11px] text-slate-300">
                          <p><span className="text-slate-500">Digest Completo:</span> <span className="text-emerald-400 break-all">{store.cachedDocumentHash}</span></p>
                          <p><span className="text-slate-500">Normalización:</span> Unicode NFC + Unix LF (ISO/IEC 10646)</p>
                          <p><span className="text-slate-500">Sello Temporal:</span> CENAM UTC Stratum-1 vía PSC</p>
                          <p><span className="text-slate-500">Invariante:</span> 100% Determinista (0% Colisión)</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      )}

      {/* =========================================================================
          TAB 3: CLIENT SIMULATOR / REVIEW MODE
      ========================================================================== */}
      {activeTab === 'client-review' && (
        <section className="flex-1 flex flex-col items-center p-6 lg:p-10 max-w-5xl mx-auto w-full space-y-6 animate-fadeIn">
          
          {/* Client Simulator Banner */}
          <div className="w-full p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center font-bold">
                <Sliders className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-amber-500">Modo Simulador: Vista del Cliente ({store.parties.client.commercialName || store.parties.client.legalName})</h3>
                <p className="opacity-80 mt-0.5">Así es como tu cliente recibe, lee y aprueba tu propuesta sin necesidad de registrarse.</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsDrawerOpen(true)}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold transition-all flex items-center gap-1.5"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Solicitar Ajuste / Negociar</span>
              </button>

              <button
                onClick={openSignatureModal}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all flex items-center gap-1.5"
              >
                <FileSignature className="w-3.5 h-3.5" />
                <span>Aprobar y Firmar</span>
              </button>
            </div>
          </div>

          {/* The Client Sheet */}
          <div className={`w-full max-w-[800px] p-8 lg:p-12 rounded-2xl transition-all duration-300 print-document ${paperClasses}`}>
            {/* Paper Preview rendered from store */}
            <div className="border-b border-slate-200 pb-6 mb-6 flex items-start justify-between">
              <div>
                <span className="text-[11px] font-mono tracking-widest text-slate-500 uppercase block mb-1">
                  PROPUESTA DE ACUERDO BILATERAL · ID: {store.contractCode}
                </span>
                <h1 className="text-xl lg:text-2xl font-serif font-bold tracking-tight text-slate-900">
                  {store.scope.projectTitle}
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                  Remitido por {store.parties.creator.legalName} ({store.parties.creator.commercialName}) para {store.parties.client.legalName}
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
                  <h4 className="text-lg font-bold text-slate-900 mt-1">
                    {currencySymbol}{(store.payments.totalAmountCents / 100).toLocaleString('es-MX', { minimumFractionDigits: 2 })} {store.payments.currency}
                  </h4>
                  <p className="text-xs text-slate-600 mt-1">Dividido en {store.payments.milestones.length} hito(s) de pago con entregables vinculados.</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] font-bold text-emerald-600 uppercase font-mono tracking-wider">Garantía de Entrega</span>
                  <h4 className="text-base font-bold text-slate-900 mt-1">30 días naturales</h4>
                  <p className="text-xs text-slate-600 mt-1">Incluye {store.governance.includedRevisionRounds} rondas completas de ajustes sobre los entregables acordados.</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 space-y-1">
                <div className="flex items-center gap-2 font-bold text-emerald-800">
                  <Lock className="w-4 h-4" />
                  <span>Certeza Jurídica para Ambas Partes (Art. 83 LFDA)</span>
                </div>
                <p>Al firmar este acuerdo, el creador garantiza la entrega de los archivos finales y tú garantizas la titularidad patrimonial libre de gravamen una vez liquidado el finiquito.</p>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-200">
                <button
                  onClick={() => setIsDrawerOpen(true)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold transition-all"
                >
                  Proponer ajuste en días o entregables
                </button>
                <button
                  onClick={openSignatureModal}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md"
                >
                  Firmar y Validar Acuerdo
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* =========================================================================
          TAB 4: VAULT DASHBOARD (BÓVEDA CRIPTOGRÁFICA & GESTIÓN DE VIGENCIAS)
      ========================================================================== */}
      {activeTab === 'vault' && (
        <section className="flex-1 max-w-6xl mx-auto p-6 lg:p-10 w-full space-y-6 overflow-y-auto animate-fadeIn">
          
          {/* Header & Search */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Bóveda Criptográfica de Acuerdos</h1>
              <p className="text-xs opacity-75 mt-1">Historial inmutable de contratos, constancias NOM-151 y renovación en 1 clic.</p>
            </div>

            <div className="flex items-center gap-3">
              {/* Create new contract button */}
              <button
                onClick={() => {
                  store.resetContract();
                  setActiveTab('creator');
                  setCurrentStep(1);
                }}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Nuevo Contrato en Blanco</span>
              </button>

              {/* Instant Search O(1) */}
              <div className="relative w-full md:w-64">
                <Search className="w-4 h-4 opacity-50 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Buscar por clave o cliente..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`${inputClass} pl-10 text-xs`}
                />
              </div>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            
            {/* Card 1: Current Active Contract */}
            <div className={`p-5 rounded-2xl border ${panelBg} space-y-3 hover:border-blue-500 transition-all`}>
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-blue-500 bg-blue-500/10 px-2.5 py-1 rounded-lg border border-blue-500/20">
                  {store.contractCode}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                  Borrador Activo
                </span>
              </div>

              <div>
                <h3 className="font-bold text-sm">{store.scope.projectTitle}</h3>
                <p className="text-xs opacity-75 mt-0.5">Cliente: {store.parties.client.legalName}</p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800 text-xs">
                <span className="font-mono font-bold">
                  {currencySymbol}{(store.payments.totalAmountCents / 100).toLocaleString('es-MX', { minimumFractionDigits: 2 })} {store.payments.currency}
                </span>
                <button
                  onClick={() => {
                    setActiveTab('creator');
                    setCurrentStep(1);
                  }}
                  className="text-xs font-bold text-blue-500 hover:underline flex items-center gap-1"
                >
                  <span>Editar</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Card 2: Sample NOM-151 Stamped Contract */}
            <div className={`p-5 rounded-2xl border ${panelBg} space-y-3 opacity-90 hover:opacity-100 transition-all`}>
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
                  onClick={downloadContractMarkdown}
                  className="text-xs font-bold text-blue-500 hover:underline flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Descargar</span>
                </button>
              </div>
            </div>

            {/* Card 3: Expired / Renewal Ready Contract */}
            <div className={`p-5 rounded-2xl border ${panelBg} space-y-3 opacity-80 hover:opacity-100 transition-all`}>
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
                <span className="font-mono font-bold">$28,000.00 MXN</span>
                <button
                  onClick={() => {
                    store.resetContract(`PACT-RENEW-${Math.random().toString(36).substring(2, 6).toUpperCase()}`);
                    store.updateScope({ projectTitle: 'Renovación: Mantenimiento de Design System Trimestre 2' });
                    setActiveTab('creator');
                    setCurrentStep(1);
                  }}
                  className="text-xs font-bold text-amber-500 hover:underline flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Renovar en 1 Clic</span>
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* =========================================================================
          TAB 5: CONFIRMATION & OFFICIAL DOWNLOAD HUB (POST-SIGNATURE)
      ========================================================================== */}
      {activeTab === 'confirmed' && (
        <section className="flex-1 flex flex-col justify-center items-center p-6 lg:p-10 max-w-3xl mx-auto w-full space-y-6 animate-fadeIn">
          
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
          <div className={`w-full p-6 rounded-2xl border ${panelBg} space-y-4 text-xs`}>
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <span className="font-bold text-blue-500 font-mono">FOLIO OFICIAL: {store.contractCode}</span>
              <span className="font-mono text-[11px] opacity-75">Sello PSC Activo</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] font-mono">
              <div>
                <span className="opacity-60 block">Hash Criptográfico SHA-256:</span>
                <span className="font-bold text-blue-500 break-all">{store.cachedDocumentHash}</span>
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
              onClick={downloadContractMarkdown}
              className="py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.02]"
            >
              <Download className="w-4 h-4" />
              <span>Descargar Contrato (.MD)</span>
            </button>

            <button
              onClick={handlePrint}
              className={`py-3 px-4 rounded-xl border ${pillClass} font-bold text-xs flex items-center justify-center gap-2 transition-all hover:scale-[1.02]`}
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir / Guardar como PDF</span>
            </button>

            <button
              onClick={downloadNOM151Receipt}
              className={`py-3 px-4 rounded-xl border ${pillClass} font-bold text-xs flex items-center justify-center gap-2 transition-all hover:scale-[1.02]`}
            >
              <Shield className="w-4 h-4 text-emerald-500" />
              <span>Descargar Constancia NOM-151 (.JSON)</span>
            </button>

            <button
              onClick={handleCopyLink}
              className={`py-3 px-4 rounded-xl border ${pillClass} font-bold text-xs flex items-center justify-center gap-2 transition-all hover:scale-[1.02]`}
            >
              <Share2 className="w-4 h-4 text-amber-500" />
              <span>{copiedLink ? '¡Enlace Copiado al Portapapeles!' : 'Copiar Enlace para el Cliente'}</span>
            </button>
          </div>

          <div className="pt-2 flex items-center gap-4 text-xs font-bold">
            <button
              onClick={() => {
                store.resetContract();
                setActiveTab('creator');
                setCurrentStep(1);
              }}
              className="text-slate-400 hover:text-white flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Crear Otro Contrato</span>
            </button>
            <span className="opacity-30">|</span>
            <button
              onClick={() => setActiveTab('vault')}
              className="text-blue-500 hover:underline flex items-center gap-1"
            >
              <span>Ir a la Bóveda de Contratos</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </section>
      )}

      {/* =========================================================================
          NEGOTIATION DRAWER (BILATERAL COUNTERPROPOSAL & DIFF VISUAL)
      ========================================================================== */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs transition-opacity duration-300">
          <div className={`w-full max-w-md h-full ${panelBg} border-l p-6 flex flex-col justify-between shadow-2xl overflow-y-auto animate-slideLeft`}>
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-amber-500" />
                  <h3 className="font-bold text-base">Negociación Bilateral de Términos</h3>
                </div>
                <button onClick={() => setIsDrawerOpen(false)} className="opacity-60 hover:opacity-100 p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 text-xs">
                <p className="opacity-80 leading-relaxed">
                  El cliente puede proponer modificaciones puntuales a los términos sin romper el borrador ni recurrir a cadenas de emails caóticas.
                </p>

                {/* Adjustment Field */}
                <div className={`p-4 rounded-xl border ${pillClass} space-y-3`}>
                  <label className="font-bold block text-amber-500">
                    Propuesta de Ajuste: Días de Revisión Tácita
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="3"
                      max="15"
                      value={adjustedDays}
                      onChange={(e) => {
                        setAdjustedDays(parseInt(e.target.value));
                        setHasAdjustmentProposal(true);
                      }}
                      className="flex-1 accent-amber-500 cursor-pointer"
                    />
                    <span className="font-mono font-bold text-base">{adjustedDays} días</span>
                  </div>
                  <p className="text-[11px] opacity-70">Valor original del creador: {store.governance.tacitApprovalWindowDays} días hábiles.</p>
                </div>

                {/* Visual Diff Box */}
                {hasAdjustmentProposal && (
                  <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-2 animate-fadeIn">
                    <span className="text-[10px] font-bold text-amber-500 uppercase font-mono">Diferencia Visual (Diff v1.0 ➔ v1.1):</span>
                    <div className="text-[11px] font-mono space-y-1">
                      <p className="line-through text-red-500 bg-red-500/10 p-1 rounded">
                        - Cláusula 4: Plazo de revisión de {store.governance.tacitApprovalWindowDays} días hábiles.
                      </p>
                      <p className="text-emerald-500 bg-emerald-500/10 p-1 rounded font-bold">
                        + Cláusula 4: Plazo de revisión de {adjustedDays} días hábiles.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-6 border-t border-slate-200 dark:border-slate-800 space-y-2">
              <button
                onClick={() => {
                  alert(`¡Propuesta enviada al creador! Ajuste solicitado: ${adjustedDays} días de revisión.`);
                  setIsDrawerOpen(false);
                }}
                className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl transition-all shadow-md"
              >
                Enviar Contrapropuesta al Creador
              </button>

              {hasAdjustmentProposal && (
                <button
                  onClick={() => {
                    store.updateGovernance({ tacitApprovalWindowDays: adjustedDays });
                    alert('¡Versión v1.1 emitida y aprobada bilateralmente! El contrato está listo para firma.');
                    setIsDrawerOpen(false);
                    setHasAdjustmentProposal(false);
                  }}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 shadow-md"
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
          SIGNATURE MODAL & NOM-151 STAMPING ENGINE (FIXED: NEVER OPENS EMPTY)
      ========================================================================== */}
      {isSignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className={`w-full max-w-lg ${panelBg} border rounded-2xl p-6 space-y-5 shadow-2xl animate-scaleUp`}>
            
            <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <FileSignature className="w-5 h-5 text-emerald-500" />
                <h3 className="font-bold text-base">Centro de Firma & Timbrado Legal NOM-151</h3>
              </div>
              <button onClick={() => setIsSignModalOpen(false)} className="opacity-60 hover:opacity-100 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Signature Tabs (Touch vs Typed Script vs e.firma) - Always visible if not stamping */}
            {!isStamping && (
              <div className="space-y-4">
                <div className={`grid grid-cols-3 gap-1.5 p-1 rounded-xl text-xs border ${pillClass}`}>
                  <button
                    onClick={() => setSignatureType('touch')}
                    className={`py-2 rounded-lg font-semibold transition-all ${
                      signatureType === 'touch' ? 'bg-blue-600 text-white shadow-sm' : 'opacity-70 hover:opacity-100'
                    }`}
                  >
                    ✍️ Trazo / Touch
                  </button>
                  <button
                    onClick={() => setSignatureType('type')}
                    className={`py-2 rounded-lg font-semibold transition-all ${
                      signatureType === 'type' ? 'bg-blue-600 text-white shadow-sm' : 'opacity-70 hover:opacity-100'
                    }`}
                  >
                    🖋️ Tipeada (Script)
                  </button>
                  <button
                    onClick={() => setSignatureType('efirma')}
                    className={`py-2 rounded-lg font-semibold transition-all ${
                      signatureType === 'efirma' ? 'bg-indigo-600 text-white shadow-sm' : 'opacity-70 hover:opacity-100'
                    }`}
                  >
                    🔐 e.firma SAT
                  </button>
                </div>

                {/* Option 1: Touch Drawing Canvas */}
                {signatureType === 'touch' && (
                  <div className="space-y-2">
                    <p className="text-xs opacity-75">Dibuja tu firma con tu dedo o ratón sobre el lienzo:</p>
                    <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 bg-white rounded-xl overflow-hidden relative shadow-inner">
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
                          Rúbrica digital aquí (Dibuja con mouse o dedo)
                        </div>
                      )}
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-[11px] opacity-60">Vector Bézier temporal ~2 KB</span>
                      <button onClick={clearCanvas} className="text-red-500 hover:underline">
                        Limpiar lienzo
                      </button>
                    </div>
                  </div>
                )}

                {/* Option 2: Typed Name in Realistic Cursive / Script Font */}
                {signatureType === 'type' && (
                  <div className="space-y-3">
                    <div>
                      <label className={labelClass}>Escribe tu nombre legal completo</label>
                      <input
                        type="text"
                        value={typedName}
                        onChange={(e) => setTypedName(e.target.value)}
                        placeholder="Ej. Sofía Valenzuela Mendoza"
                        className={inputClass}
                      />
                    </div>

                    <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-1 shadow-inner text-center">
                      <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block">
                        Vista Previa de tu Firma Caligráfica Oficial
                      </span>
                      <div className="h-20 flex items-center justify-center border-b border-slate-300">
                        <span className="font-signature text-3xl sm:text-4xl text-[#1D4ED8] tracking-wide select-none">
                          {typedName.trim() || 'Tu Nombre Aquí'}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 block pt-1 font-mono">
                        Rúbrica Electrónica Simple · Art. 89 Código de Comercio
                      </span>
                    </div>
                  </div>
                )}

                {/* Option 3: e.firma SAT Zero-Knowledge */}
                {signatureType === 'efirma' && (
                  <div className={`p-4 rounded-xl border ${infoBoxClass} space-y-3 text-xs`}>
                    <div className="flex items-center gap-2 text-indigo-500 font-bold">
                      <Shield className="w-4 h-4" />
                      <span>Firma Electrónica Avanzada (FIEL / e.firma del SAT)</span>
                    </div>
                    <p className="text-[11px] opacity-80 leading-relaxed">
                      Tus archivos <code>.cer</code> y <code>.key</code> se procesan en la memoria local de tu navegador (Web Worker). Nunca se envían a ningún servidor (Arquitectura Zero-Knowledge).
                    </p>
                    <div className={`p-3 rounded-lg border text-center cursor-pointer ${pillClass} hover:border-blue-500 transition-colors`}>
                      Cargar certificado (.cer) y llave (.key)
                    </div>
                  </div>
                )}

                {/* Validation Notice if not ready */}
                {!isSignReady && (
                  <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-500 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>Dibuja tu rúbrica o escribe tu nombre para habilitar la firma.</span>
                  </div>
                )}

                {/* Confirm Action Button */}
                <button
                  disabled={!isSignReady}
                  onClick={handleStartStamping}
                  className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 disabled:opacity-40 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 hover:scale-[1.01]"
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
                <h4 className="font-bold text-sm">Timbrando con Prestador de Certificación (PSC)...</h4>
                <div className="space-y-2 max-w-xs mx-auto text-xs opacity-75 font-mono text-left">
                  <div className={`flex items-center gap-2 ${stampingStep >= 1 ? 'text-emerald-500 font-bold' : 'opacity-40'}`}>
                    <CheckCheck className="w-3.5 h-3.5" /> 1. Digest SHA-256 canónico generado
                  </div>
                  <div className={`flex items-center gap-2 ${stampingStep >= 2 ? 'text-emerald-500 font-bold' : 'opacity-40'}`}>
                    <CheckCheck className="w-3.5 h-3.5" /> 2. Transmisión a HSM FIPS 140-2 Nivel 3
                  </div>
                  <div className={`flex items-center gap-2 ${stampingStep >= 3 ? 'text-emerald-500 font-bold' : 'opacity-40'}`}>
                    <CheckCheck className="w-3.5 h-3.5" /> 3. Estampa de tiempo CENAM atómica UTC
                  </div>
                  <div className={`flex items-center gap-2 ${stampingStep >= 4 ? 'text-emerald-500 font-bold' : 'opacity-40'}`}>
                    <CheckCheck className="w-3.5 h-3.5" /> 4. Emisión Constancia ASN.1 DER
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
