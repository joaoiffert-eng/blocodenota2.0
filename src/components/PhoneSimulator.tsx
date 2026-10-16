import React from 'react';
import { Smartphone, Monitor, Code2, FolderArchive, Sparkles } from 'lucide-react';
import { MobileStatusBar } from './MobileStatusBar';

interface PhoneSimulatorProps {
  children: React.ReactNode;
  isPhoneMode: boolean;
  onTogglePhoneMode: () => void;
  onOpenJavaModal: () => void;
}

export const PhoneSimulator: React.FC<PhoneSimulatorProps> = ({
  children,
  isPhoneMode,
  onTogglePhoneMode,
  onOpenJavaModal,
}) => {
  if (!isPhoneMode) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-100 dark:bg-slate-950">
        {/* Top Control Bar */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 py-2 flex items-center justify-between text-xs sticky top-0 z-50">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-blue-500" />
              Bloco de Notas • Edição Java & Mobile
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenJavaModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold bg-amber-500 text-white hover:bg-amber-600 transition-all shadow-sm active:scale-95 cursor-pointer"
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Ver Código Java (Android)</span>
            </button>

            <button
              onClick={onTogglePhoneMode}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer border border-slate-200 dark:border-slate-700"
            >
              <Smartphone className="w-3.5 h-3.5 text-blue-500" />
              <span>Alternar para Formato Celular</span>
            </button>
          </div>
        </div>

        <div className="flex-1">{children}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-200 via-slate-100 to-indigo-100/60 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950/40 flex flex-col items-center justify-center p-2 sm:p-6 select-none sm:select-auto">
      
      {/* Outer Floating Bar */}
      <header className="mb-3 sm:mb-4 w-full max-w-md flex items-center justify-between gap-2 px-3 py-2 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-md">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
            Simulador Celular
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-md font-semibold bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300">
            Android / Java
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={onOpenJavaModal}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-sm transition-all active:scale-95 cursor-pointer"
            title="Abrir arquivos Java para Android Studio"
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Código Java</span>
          </button>

          <button
            onClick={onTogglePhoneMode}
            className="p-1.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
            title="Ver em tela inteira"
            aria-label="Ver em tela inteira"
          >
            <Monitor className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Realistic Smartphone Shell */}
      <div className="relative w-full max-w-[400px] h-[830px] max-h-[92vh] bg-slate-950 rounded-[48px] p-2.5 shadow-2xl ring-1 ring-slate-800 shadow-blue-500/10 border-[6px] border-slate-900 flex flex-col overflow-hidden">
        
        {/* Left Side Buttons (Volume) */}
        <div className="absolute -left-[9px] top-28 w-1 h-12 bg-slate-800 rounded-l-md hidden sm:block" />
        <div className="absolute -left-[9px] top-44 w-1 h-12 bg-slate-800 rounded-l-md hidden sm:block" />

        {/* Right Side Button (Power) */}
        <div className="absolute -right-[9px] top-36 w-1 h-14 bg-slate-800 rounded-r-md hidden sm:block" />

        {/* Smartphone Screen Inner Display */}
        <div className="relative w-full h-full bg-slate-50 dark:bg-slate-950 rounded-[40px] overflow-hidden flex flex-col border border-slate-800/40 shadow-inner">
          
          {/* Mobile Status Bar */}
          <MobileStatusBar />

          {/* Screen Scrollable / Interactive Body */}
          <div className="flex-1 overflow-hidden flex flex-col relative">
            {children}
          </div>

          {/* Bottom Gesture / Home Bar Indicator */}
          <div className="h-4 bg-white/90 dark:bg-slate-900/90 flex items-center justify-center shrink-0 z-30">
            <div className="w-32 h-1 bg-slate-400/80 dark:bg-slate-600 rounded-full" />
          </div>

        </div>

      </div>

      {/* Hint underneath simulator */}
      <p className="mt-3 text-[11px] text-slate-500 dark:text-slate-400 text-center hidden sm:block">
        💡 Toque e navegue como em um smartphone real. O código fonte completo está disponível no botão <strong>Código Java</strong>.
      </p>

    </div>
  );
};
