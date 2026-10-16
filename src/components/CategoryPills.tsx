import React from 'react';
import { 
  Folder, 
  Star, 
  GraduationCap, 
  Briefcase, 
  HeartHandshake, 
  LayoutGrid, 
  List, 
  ArrowUpDown 
} from 'lucide-react';
import { FilterCategory, SortOption, ViewMode, Note } from '../types/note';

interface CategoryPillsProps {
  currentFilter: FilterCategory;
  onSelectFilter: (filter: FilterCategory) => void;
  notes: Note[];
  viewMode: ViewMode;
  onToggleViewMode: () => void;
  sortOption: SortOption;
  onSortChange: (sort: SortOption) => void;
}

export const CategoryPills: React.FC<CategoryPillsProps> = ({
  currentFilter,
  onSelectFilter,
  notes,
  viewMode,
  onToggleViewMode,
  sortOption,
  onSortChange,
}) => {
  const countAll = notes.length;
  const countFavorites = notes.filter((n) => n.isFavorite).length;
  const countEstudos = notes.filter((n) => n.category === 'estudos').length;
  const countTrabalho = notes.filter((n) => n.category === 'trabalho').length;
  const countPessoal = notes.filter((n) => n.category === 'pessoal').length;

  const filters = [
    {
      id: 'todas' as FilterCategory,
      label: 'Todas',
      icon: Folder,
      count: countAll,
      activeColor: 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm',
      inactiveColor: 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-800',
    },
    {
      id: 'favoritos' as FilterCategory,
      label: 'Favoritos',
      icon: Star,
      count: countFavorites,
      activeColor: 'bg-amber-500 text-white shadow-md shadow-amber-500/20',
      inactiveColor: 'text-slate-700 dark:text-slate-300 hover:bg-amber-50 dark:hover:bg-amber-950/30 border-slate-200 dark:border-slate-800',
    },
    {
      id: 'estudos' as FilterCategory,
      label: 'Estudos',
      icon: GraduationCap,
      count: countEstudos,
      activeColor: 'bg-blue-600 text-white shadow-md shadow-blue-600/20',
      inactiveColor: 'text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-950/30 border-slate-200 dark:border-slate-800',
    },
    {
      id: 'trabalho' as FilterCategory,
      label: 'Trabalho',
      icon: Briefcase,
      count: countTrabalho,
      activeColor: 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20',
      inactiveColor: 'text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 border-slate-200 dark:border-slate-800',
    },
    {
      id: 'pessoal' as FilterCategory,
      label: 'Pessoal',
      icon: HeartHandshake,
      count: countPessoal,
      activeColor: 'bg-purple-600 text-white shadow-md shadow-purple-600/20',
      inactiveColor: 'text-slate-700 dark:text-slate-300 hover:bg-purple-50 dark:hover:bg-purple-950/30 border-slate-200 dark:border-slate-800',
    },
  ];

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-2 border-b border-slate-200/60 dark:border-slate-800/80 mb-6">
      {/* Category Pills */}
      <div 
        className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none"
        role="tablist"
        aria-label="Filtrar por categoria"
      >
        {filters.map((filter) => {
          const Icon = filter.icon;
          const isActive = currentFilter === filter.id;
          return (
            <button
              key={filter.id}
              onClick={() => onSelectFilter(filter.id)}
              role="tab"
              aria-selected={isActive}
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all border shrink-0 cursor-pointer ${
                isActive
                  ? filter.activeColor
                  : `bg-white dark:bg-slate-900 ${filter.inactiveColor}`
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-current' : 'text-slate-500 dark:text-slate-400'}`} />
              <span>{filter.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[11px] font-bold ${
                  isActive
                    ? 'bg-black/20 text-white dark:bg-black/20'
                    : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                {filter.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Sort & View Options */}
      <div className="flex items-center justify-end gap-2 shrink-0">
        <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1 text-xs text-slate-600 dark:text-slate-300">
          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={sortOption}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
            className="bg-transparent outline-none cursor-pointer font-medium"
            aria-label="Ordenar anotações por"
          >
            <option value="updated-desc" className="dark:bg-slate-900">Mais recentes</option>
            <option value="updated-asc" className="dark:bg-slate-900">Mais antigas</option>
            <option value="title-asc" className="dark:bg-slate-900">Título (A-Z)</option>
            <option value="title-desc" className="dark:bg-slate-900">Título (Z-A)</option>
          </select>
        </div>

        <button
          onClick={onToggleViewMode}
          className="p-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          title={viewMode === 'grid' ? 'Mudar para exibição em lista' : 'Mudar para exibição em cartões'}
          aria-label={viewMode === 'grid' ? 'Mudar para exibição em lista' : 'Mudar para exibição em cartões'}
        >
          {viewMode === 'grid' ? (
            <List className="w-4 h-4" />
          ) : (
            <LayoutGrid className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  );
};
