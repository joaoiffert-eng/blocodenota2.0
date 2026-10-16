import React from 'react';
import { 
  Plus, 
  Search, 
  X, 
  Sun, 
  Moon, 
  LogOut, 
  BookOpen, 
  Type,
  Download,
  Upload
} from 'lucide-react';
import { TextSize } from '../types/note';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onNewNote: () => void;
  darkMode: boolean;
  onToggleTheme: () => void;
  textSize: TextSize;
  onCycleTextSize: () => void;
  onOpenExitModal: () => void;
  onExportBackup: () => void;
  onImportBackup: (event: React.ChangeEvent<HTMLInputElement>) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  onSearchChange,
  onNewNote,
  darkMode,
  onToggleTheme,
  textSize,
  onCycleTextSize,
  onOpenExitModal,
  onExportBackup,
  onImportBackup,
  fileInputRef,
}) => {
  const textSizeLabels: Record<TextSize, string> = {
    normal: 'Texto: Normal (100%)',
    large: 'Texto: Grande (115%)',
    xlarge: 'Texto: Extra Grande (130%)',
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 py-2 gap-3 sm:gap-4">
          
          {/* Logo & App Name */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-purple-500 p-0.5 shadow-md shadow-blue-500/20 flex items-center justify-center text-white">
              <div className="w-full h-full bg-gradient-to-tr from-blue-600 via-purple-600 to-emerald-500 rounded-[14px] flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                  Bloco de Notas
                </h1>
                <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  Acessível
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
                Organize estudos, trabalho e vida pessoal
              </p>
            </div>
          </div>

          {/* Search Bar - Center */}
          <div className="flex-1 max-w-md mx-2 sm:mx-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Pesquisar por título ou conteúdo... (/)"
                className="w-full pl-10 pr-9 py-2 text-sm rounded-xl bg-slate-100/90 dark:bg-slate-800/90 border border-transparent focus:border-blue-400 dark:focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none transition-all focus:ring-2 focus:ring-blue-400/20"
                aria-label="Pesquisar anotações"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  aria-label="Limpar pesquisa"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Actions & Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* New Note Button */}
            <button
              onClick={onNewNote}
              className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-95 shadow-md shadow-blue-600/20 transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-blue-500"
              aria-label="Criar nova anotação"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Nova Anotação</span>
            </button>

            {/* Accessibility: Text Size Toggle */}
            <button
              onClick={onCycleTextSize}
              className="p-2 sm:px-2.5 sm:py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/80 transition-all active:scale-95 flex items-center gap-1 cursor-pointer"
              title={textSizeLabels[textSize]}
              aria-label={textSizeLabels[textSize]}
            >
              <Type className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span className="text-xs font-semibold uppercase hidden lg:inline">
                {textSize === 'normal' ? 'A' : textSize === 'large' ? 'A+' : 'A++'}
              </span>
            </button>

            {/* Theme Toggle: Dark/Light Mode */}
            <button
              onClick={onToggleTheme}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/80 transition-all active:scale-95 cursor-pointer"
              title={darkMode ? 'Ativar modo claro' : 'Ativar modo escuro'}
              aria-label={darkMode ? 'Ativar modo claro' : 'Ativar modo escuro'}
            >
              {darkMode ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-600" />
              )}
            </button>

            {/* Backup Export */}
            <button
              onClick={onExportBackup}
              className="hidden md:flex p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/80 transition-all active:scale-95 cursor-pointer"
              title="Fazer backup das anotações (Download JSON)"
              aria-label="Exportar anotações"
            >
              <Download className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </button>

            {/* Hidden Input for Import */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={onImportBackup}
              accept=".json"
              className="hidden"
              aria-hidden="true"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="hidden md:flex p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/80 transition-all active:scale-95 cursor-pointer"
              title="Restaurar anotações de arquivo JSON"
              aria-label="Importar anotações"
            >
              <Upload className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </button>

            {/* Exit Button */}
            <button
              onClick={onOpenExitModal}
              className="p-2 sm:px-3 sm:py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 dark:hover:text-rose-400 border border-slate-200 dark:border-slate-700/80 transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
              title="Sair do aplicativo"
              aria-label="Sair do aplicativo"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline text-xs font-medium">Sair</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
