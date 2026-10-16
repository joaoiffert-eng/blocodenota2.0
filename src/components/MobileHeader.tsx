import React, { useState } from 'react';
import { 
  BookOpen, 
  Search, 
  X, 
  Sun, 
  Moon, 
  LogOut, 
  Code2, 
  Type
} from 'lucide-react';
import { TextSize } from '../types/note';

interface MobileHeaderProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  darkMode: boolean;
  onToggleTheme: () => void;
  textSize: TextSize;
  onCycleTextSize: () => void;
  onOpenJavaModal: () => void;
  onOpenExitModal: () => void;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({
  searchQuery,
  onSearchChange,
  darkMode,
  onToggleTheme,
  textSize,
  onCycleTextSize,
  onOpenJavaModal,
  onOpenExitModal,
}) => {
  const [showSearch, setShowSearch] = useState(false);

  return (
    <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 px-4 pt-1.5 pb-2.5 shrink-0 z-20">
      <div className="flex items-center justify-between gap-2">
        {/* App Logo & Title */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-purple-500 p-0.5 shadow-sm flex items-center justify-center text-white shrink-0">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
              Bloco de Notas
            </h1>
            <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
              Java • Acessível
            </span>
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1">
          {/* Toggle search */}
          <button
            onClick={() => setShowSearch(!showSearch)}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              showSearch || searchQuery
                ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400'
                : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
            }`}
            title="Buscar"
            aria-label="Abrir busca"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Java Code Button */}
          <button
            onClick={onOpenJavaModal}
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 text-xs font-bold transition-all border border-amber-500/20 cursor-pointer"
            title="Ver código-fonte Android Java"
            aria-label="Ver código Java"
          >
            <Code2 className="w-3.5 h-3.5" />
            <span className="text-[11px]">Java</span>
          </button>

          {/* Text Size */}
          <button
            onClick={onCycleTextSize}
            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 cursor-pointer"
            title="Alterar tamanho do texto"
            aria-label="Alterar tamanho do texto"
          >
            <Type className="w-4 h-4 text-purple-500" />
          </button>

          {/* Theme */}
          <button
            onClick={onToggleTheme}
            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 cursor-pointer"
            title={darkMode ? 'Modo Claro' : 'Modo Escuro'}
            aria-label="Alternar tema claro/escuro"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-500" />}
          </button>

          {/* Exit */}
          <button
            onClick={onOpenExitModal}
            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
            title="Sair"
            aria-label="Sair"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Expandable Search Input */}
      {(showSearch || searchQuery) && (
        <div className="mt-2 relative animate-in fade-in slide-in-from-top-1 duration-150">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar por título ou texto..."
            autoFocus
            className="w-full pl-8 pr-8 py-1.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};
