import React from 'react';
import { FilterCategory, Note } from '../types/note';

interface MobileBottomNavProps {
  currentFilter: FilterCategory;
  onSelectFilter: (filter: FilterCategory) => void;
  notes: Note[];
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentFilter,
  onSelectFilter,
  notes,
}) => {
  const countAll = notes.length;
  const countEstudos = notes.filter((n) => n.category === 'estudos').length;
  const countTrabalho = notes.filter((n) => n.category === 'trabalho').length;
  const countPessoal = notes.filter((n) => n.category === 'pessoal').length;
  const countFavorites = notes.filter((n) => n.isFavorite).length;

  const tabs = [
    {
      id: 'todas' as FilterCategory,
      label: 'Início',
      count: countAll,
      activeStyle: 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm font-bold',
      inactiveStyle: 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 font-medium',
      badgeActive: 'bg-white/20 text-white dark:bg-slate-900/20 dark:text-slate-900',
      badgeInactive: 'bg-slate-200/80 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    },
    {
      id: 'estudos' as FilterCategory,
      label: 'Estudos',
      count: countEstudos,
      activeStyle: 'bg-blue-600 text-white shadow-sm shadow-blue-500/20 font-bold',
      inactiveStyle: 'text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 font-medium',
      badgeActive: 'bg-white/25 text-white',
      badgeInactive: 'bg-blue-100 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300',
    },
    {
      id: 'trabalho' as FilterCategory,
      label: 'Trabalho',
      count: countTrabalho,
      activeStyle: 'bg-emerald-600 text-white shadow-sm shadow-emerald-500/20 font-bold',
      inactiveStyle: 'text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 font-medium',
      badgeActive: 'bg-white/25 text-white',
      badgeInactive: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300',
    },
    {
      id: 'pessoal' as FilterCategory,
      label: 'Pessoal',
      count: countPessoal,
      activeStyle: 'bg-purple-600 text-white shadow-sm shadow-purple-500/20 font-bold',
      inactiveStyle: 'text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/40 font-medium',
      badgeActive: 'bg-white/25 text-white',
      badgeInactive: 'bg-purple-100 text-purple-700 dark:bg-purple-950/80 dark:text-purple-300',
    },
    {
      id: 'favoritos' as FilterCategory,
      label: 'Favoritos',
      count: countFavorites,
      activeStyle: 'bg-amber-500 text-white shadow-sm shadow-amber-500/20 font-bold',
      inactiveStyle: 'text-slate-600 dark:text-slate-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/40 font-medium',
      badgeActive: 'bg-white/25 text-white',
      badgeInactive: 'bg-amber-100 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300',
    },
  ];

  return (
    <nav
      className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200/80 dark:border-slate-800 px-2 py-2 flex items-center justify-between gap-1 shrink-0 z-30 overflow-x-auto scrollbar-none"
      aria-label="Navegação móvel por categorias"
    >
      {tabs.map((tab) => {
        const isActive = currentFilter === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onSelectFilter(tab.id)}
            className={`flex-1 py-2 px-1.5 rounded-xl transition-all cursor-pointer text-center flex items-center justify-center gap-1.5 whitespace-nowrap text-xs ${
              isActive ? tab.activeStyle : tab.inactiveStyle
            }`}
            aria-label={`${tab.label} (${tab.count} anotações)`}
          >
            <span className="tracking-tight">{tab.label}</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                isActive ? tab.badgeActive : tab.badgeInactive
              }`}
            >
              {tab.count}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
