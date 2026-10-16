import React from 'react';
import { FileQuestion, Plus, SearchX, Sparkles } from 'lucide-react';
import { FilterCategory } from '../types/note';

interface EmptyStateProps {
  searchQuery: string;
  currentFilter: FilterCategory;
  onClearSearch: () => void;
  onNewNote: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  searchQuery,
  currentFilter,
  onClearSearch,
  onNewNote,
}) => {
  const isSearching = searchQuery.trim().length > 0;

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-blue-100 via-purple-100 to-emerald-100 dark:from-blue-950/40 dark:via-purple-950/40 dark:to-emerald-950/40 border border-slate-200 dark:border-slate-800 flex items-center justify-center mb-5 shadow-sm">
        {isSearching ? (
          <SearchX className="w-10 h-10 text-slate-500 dark:text-slate-400" />
        ) : (
          <FileQuestion className="w-10 h-10 text-blue-500 dark:text-blue-400" />
        )}
      </div>

      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
        {isSearching
          ? 'Nenhuma anotação encontrada'
          : currentFilter === 'favoritos'
          ? 'Nenhuma anotação favoritada ainda'
          : currentFilter !== 'todas'
          ? `Nenhuma anotação na categoria "${currentFilter}"`
          : 'Seu bloco de notas está vazio'}
      </h3>

      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mb-6 leading-relaxed">
        {isSearching ? (
          <>
            Não encontramos resultados para <span className="font-semibold text-slate-700 dark:text-slate-200">"{searchQuery}"</span>. Tente buscar por outros termos ou limpe a pesquisa.
          </>
        ) : currentFilter === 'favoritos' ? (
          'Clique no ícone de estrela nas suas anotações para destacá-las aqui e acessá-las com rapidez.'
        ) : (
          'Comece criando sua primeira anotação organizada para estudos, trabalho ou metas pessoais!'
        )}
      </p>

      <div className="flex items-center gap-3">
        {isSearching ? (
          <button
            onClick={onClearSearch}
            className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer"
          >
            Limpar Pesquisa
          </button>
        ) : null}

        <button
          onClick={onNewNote}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md shadow-blue-600/20 active:scale-95 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Criar Nova Anotação</span>
        </button>
      </div>
    </div>
  );
};
