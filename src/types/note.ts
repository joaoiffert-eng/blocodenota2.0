export type NoteCategory = 'estudos' | 'trabalho' | 'pessoal';

export interface Note {
  id: string;
  title: string;
  content: string;
  category: NoteCategory;
  isFavorite: boolean;
  isPinned?: boolean;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  colorAccent?: string; // Optional custom subtle tint
}

export type FilterCategory = 'todas' | 'favoritos' | NoteCategory;

export type SortOption = 'updated-desc' | 'updated-asc' | 'title-asc' | 'title-desc';

export type ViewMode = 'grid' | 'list';

export type TextSize = 'normal' | 'large' | 'xlarge';

export interface CategoryMeta {
  id: NoteCategory;
  label: string;
  iconName: string;
  badgeClass: string;
  dotColor: string;
  borderColor: string;
  lightBg: string;
  description: string;
}

export const CATEGORIES_CONFIG: Record<NoteCategory, CategoryMeta> = {
  estudos: {
    id: 'estudos',
    label: 'Estudos',
    iconName: 'GraduationCap',
    badgeClass: 'bg-blue-100/80 text-blue-800 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800/80',
    dotColor: 'bg-blue-500',
    borderColor: 'border-blue-400',
    lightBg: 'bg-blue-50/50 dark:bg-blue-950/20',
    description: 'Anotações acadêmicas, resumos, pesquisas e cursos',
  },
  trabalho: {
    id: 'trabalho',
    label: 'Trabalho',
    iconName: 'Briefcase',
    badgeClass: 'bg-emerald-100/80 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/80',
    dotColor: 'bg-emerald-500',
    borderColor: 'border-emerald-400',
    lightBg: 'bg-emerald-50/50 dark:bg-emerald-950/20',
    description: 'Projetos, reuniões, metas profissionais e tarefas',
  },
  pessoal: {
    id: 'pessoal',
    label: 'Pessoal',
    iconName: 'HeartHandshake',
    badgeClass: 'bg-purple-100/80 text-purple-800 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800/80',
    dotColor: 'bg-purple-500',
    borderColor: 'border-purple-400',
    lightBg: 'bg-purple-50/50 dark:bg-purple-950/20',
    description: 'Metas pessoais, reflexões, livros, viagens e saúde',
  },
};
