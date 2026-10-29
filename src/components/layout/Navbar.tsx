import React from 'react';
import { Shield, Home, PenTool, Sliders, BookOpen, Eye, Scale, Copy, Check } from 'lucide-react';
import { ActiveTab, ThemeMode, ThemeStyles } from '../../types/theme';
import { PreviewMode } from '../../core/store/contract-store';

interface NavbarProps {
  contractCode: string;
  copiedCode: boolean;
  onCopyCode: () => void;
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  previewMode: PreviewMode;
  onSelectPreviewMode: (mode: PreviewMode) => void;
  theme: ThemeMode;
  onSelectTheme: (theme: ThemeMode) => void;
  fontScale: number;
  onChangeFontScale: (scale: number) => void;
  styles: ThemeStyles;
}

export const Navbar: React.FC<NavbarProps> = ({
  contractCode,
  copiedCode,
  onCopyCode,
  activeTab,
  onSelectTab,
  previewMode,
  onSelectPreviewMode,
  theme,
  onSelectTheme,
  fontScale,
  onChangeFontScale,
  styles
}) => {
  return (
    <header className={`sticky top-0 z-40 border-b ${styles.headerBg} backdrop-blur-md px-4 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-3 transition-colors duration-200`}>
      {/* Brand & Home Link */}
      <div className="flex items-center gap-3">
        <button 
          onClick={() => onSelectTab('landing')}
          className="flex items-center gap-3 group text-left focus:outline-none cursor-pointer"
          title="Volver a Inicio / Landing"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold tracking-tight text-xl bg-gradient-to-r from-blue-400 to-indigo-300 bg-clip-text text-transparent">
                PACTIO
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-500 border border-blue-500/30 font-semibold">
                NOM-151
              </span>
            </div>
            <p className="text-[11px] opacity-75 hidden sm:block">Acuerdos digitales transparentes</p>
          </div>
        </button>
      </div>

      {/* Contract Code NanoID Pill */}
      <div className={`flex items-center gap-2 border rounded-xl px-3 py-1.5 ${styles.pillClass}`}>
        <span className="text-[11px] opacity-75 font-medium">Clave única:</span>
        <code className="font-mono text-xs font-bold text-blue-500 tracking-wider">{contractCode}</code>
        <button 
          onClick={onCopyCode} 
          title="Copiar clave única de búsqueda"
          className="opacity-75 hover:opacity-100 hover:text-blue-500 transition-opacity ml-1 p-0.5 cursor-pointer"
        >
          {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* View Switchers (Landing vs Creator vs Vault vs Client Preview) */}
      <nav className={`flex items-center p-1 rounded-xl border text-xs ${styles.pillClass}`}>
        <button
          onClick={() => onSelectTab('landing')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all font-medium cursor-pointer ${
            activeTab === 'landing' ? 'bg-blue-600 text-white shadow-sm' : 'hover:opacity-100 opacity-80'
          }`}
        >
          <Home className="w-3.5 h-3.5" />
          <span>Inicio</span>
        </button>

        <button
          onClick={() => onSelectTab('creator')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all font-medium cursor-pointer ${
            activeTab === 'creator' ? 'bg-blue-600 text-white shadow-sm' : 'hover:opacity-100 opacity-80'
          }`}
        >
          <PenTool className="w-3.5 h-3.5" />
          <span>Creador (Split-Pane)</span>
        </button>

        <button
          onClick={() => onSelectTab('client-review')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all font-medium cursor-pointer ${
            activeTab === 'client-review' ? 'bg-amber-600 text-white shadow-sm' : 'text-amber-500 hover:opacity-100 opacity-80'
          }`}
          title="Simular cómo el cliente recibe y negocia el contrato"
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Simulador Cliente</span>
        </button>

        <button
          onClick={() => onSelectTab('vault')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all font-medium cursor-pointer ${
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
        <div className={`flex items-center border rounded-xl p-0.5 text-xs ${styles.pillClass}`}>
          <button
            onClick={() => onSelectPreviewMode('human')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
              previewMode === 'human' ? 'bg-blue-600 text-white font-semibold' : 'opacity-70 hover:opacity-100'
            }`}
            title="Vista Humana: Sin tecnicismos jurídicos"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Humana</span>
          </button>
          <button
            onClick={() => onSelectPreviewMode('legal')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
              previewMode === 'legal' ? 'bg-indigo-600 text-white font-semibold' : 'opacity-70 hover:opacity-100'
            }`}
            title="Vista Jurídica: Cláusulas formales del Código de Comercio"
          >
            <Scale className="w-3.5 h-3.5" />
            <span>Jurídica</span>
          </button>
        </div>

        {/* Theme Selector (Midnight, Warm, Contrast) */}
        <div className={`flex items-center border rounded-xl p-0.5 text-xs ${styles.pillClass}`}>
          <button
            onClick={() => onSelectTheme('midnight')}
            className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${theme === 'midnight' ? 'bg-slate-800 text-white shadow-sm font-bold' : 'opacity-70 hover:opacity-100'}`}
            title="Tema Medianoche (Oscuro)"
          >
            🌙
          </button>
          <button
            onClick={() => onSelectTheme('warm')}
            className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${theme === 'warm' ? 'bg-[#D6C7B7] text-stone-900 shadow-sm font-bold' : 'opacity-70 hover:opacity-100'}`}
            title="Tema Papel Cálido (Lectura Sepia)"
          >
            📜
          </button>
          <button
            onClick={() => onSelectTheme('contrast')}
            className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${theme === 'contrast' ? 'bg-yellow-400 text-black shadow-sm font-extrabold' : 'opacity-70 hover:opacity-100'}`}
            title="Alto Contraste WCAG AAA"
          >
            ⚡
          </button>
        </div>

        {/* Text Scaler - Enhanced Visibility */}
        <div className={`flex items-center border rounded-xl p-0.5 text-xs ${styles.pillClass}`}>
          <button
            onClick={() => onChangeFontScale(Math.max(85, fontScale - 10))}
            className="px-2 py-1 font-bold hover:bg-black/10 dark:hover:bg-white/10 rounded transition-colors cursor-pointer"
            title="Disminuir tamaño de letra"
          >
            A-
          </button>
          <span className="text-[11px] font-mono px-1.5 opacity-80">{fontScale}%</span>
          <button
            onClick={() => onChangeFontScale(Math.min(130, fontScale + 10))}
            className="px-2 py-1 font-bold hover:bg-black/10 dark:hover:bg-white/10 rounded transition-colors cursor-pointer"
            title="Aumentar tamaño de letra"
          >
            A+
          </button>
        </div>
      </div>
    </header>
  );
};
