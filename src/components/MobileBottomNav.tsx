import React from 'react';
import { 
  Folder, 
  GraduationCap, 
  Briefcase, 
  HeartHandshake, 
  Star 
} from 'lucide-react';
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
      icon: Folder,
      count: countAll,
      activeColor: 'text-slate-900 dark:text-white',
      badgeBg: 'bg-slate-200 dark:bg-slate-700',
    },
    {
      id: 'estudos' as FilterCategory,
      label: 'Estudos',
      icon: GraduationCap,
      count: countEstudos,
      activeColor: 'text-blue-600 dark:text-blue-400',
      badgeBg: 'bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300',
    },
    {
      id: 'trabalho' as FilterCategory,
      label: 'Trabalho',
      icon: Briefcase,
      count: countTrabalho,
      activeColor: 'text-emerald-600 dark:text-emerald-400',
      badgeBg: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300',
    },
    {
      id: 'pessoal' as FilterCategory,
      label: 'Pessoal',
      icon: HeartHandshake,
      count: countPessoal,
      activeColor: 'text-purple-600 dark:text-purple-400',
      badgeBg: 'bg-purple-100 text-purple-700 dark:bg-purple-900/60 dark:text-purple-300',
    },
    {
      id: 'favoritos' as FilterCategory,
      label: 'Favoritos',
      icon: Star,
      count: countFavorites,
      activeColor: 'text-amber-500',
      badgeBg: 'bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300',
    },
  ];

  return (
    <nav
      className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200/80 dark:border-slate-800 px-2 py-1.5 flex items-center justify-around shrink-0 z-30"
      aria-label="Navegação móvel"
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = currentFilter === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onSelectFilter(tab.id)}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all relative cursor-pointer ${
              isActive ? tab.activeColor : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
            }`}
            aria-label={`${tab.label} (${tab.count} anotações)`}
          >
            <div className="relative">
              <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 stroke-[2.4]' : 'stroke-[1.8]'}`} />
              {tab.count > 0 && (
                <span
                  className={`absolute -top-1 -right-2 px-1 text-[9px] font-bold rounded-full leading-tight min-w-[14px] text-center ${tab.badgeBg}`}
                >
                  {tab.count}
                </span>
              )}
            </div>
            <span className={`text-[10px] mt-1 font-semibold tracking-tight ${isActive ? 'font-bold' : ''}`}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
