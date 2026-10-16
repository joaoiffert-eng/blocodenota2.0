import React, { useEffect, useRef } from 'react';
import { LogOut, CheckCircle2, ShieldCheck, X } from 'lucide-react';

interface ExitConfirmModalProps {
  isOpen: boolean;
  totalNotes: number;
  onConfirmExit: () => void;
  onCancel: () => void;
}

export const ExitConfirmModal: React.FC<ExitConfirmModalProps> = ({
  isOpen,
  totalNotes,
  onConfirmExit,
  onCancel,
}) => {
  const stayButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onCancel();
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      stayButtonRef.current?.focus();
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="exit-dialog-title"
    >
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
        <div className="flex items-start justify-between mb-4">
          <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <LogOut className="w-6 h-6" />
          </div>
          <button
            onClick={onCancel}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <h3
          id="exit-dialog-title"
          className="text-lg font-bold text-slate-900 dark:text-white mb-2"
        >
          Deseja sair do Bloco de Notas?
        </h3>

        <p className="text-slate-600 dark:text-slate-300 text-sm mb-4 leading-relaxed">
          Você tem <strong className="text-slate-800 dark:text-slate-100">{totalNotes} anotação(ões)</strong> armazenadas com segurança neste dispositivo. Ao sair, seus dados continuarão salvos no navegador para seu próximo acesso.
        </p>

        <div className="flex items-center gap-2.5 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs mb-6">
          <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <span>Armazenamento local seguro e sincronizado. Nenhum dado será perdido.</span>
        </div>

        <div className="flex items-center justify-end gap-3">
          <button
            ref={stayButtonRef}
            onClick={onCancel}
            className="px-4 py-2.5 rounded-xl font-medium text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-all active:scale-95 flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            Continuar no App
          </button>
          <button
            onClick={onConfirmExit}
            className="px-4 py-2.5 rounded-xl font-medium text-sm text-white bg-slate-700 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 transition-all active:scale-95 flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Confirmar e Sair
          </button>
        </div>
      </div>
    </div>
  );
};
