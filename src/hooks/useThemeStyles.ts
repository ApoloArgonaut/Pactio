import { useEffect } from 'react';
import { ThemeMode, ThemeStyles } from '../types/theme';

export function useThemeStyles(theme: ThemeMode): ThemeStyles {
  useEffect(() => {
    if (theme === 'warm') {
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'warm');
    } else {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', theme);
    }
  }, [theme]);

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
    midnight: 'p-4 rounded-xl bg-blue-950/40 border border-blue-800/60 text-blue-200',
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

  return {
    themeClasses,
    headerBg,
    panelBg,
    inputClass,
    labelClass,
    paperClasses,
    pillClass,
    infoBoxClass,
    ipBannerClass,
    previewBackdropClass,
    selectClass,
    inlineSelectClass,
    optionClass,
  };
}
