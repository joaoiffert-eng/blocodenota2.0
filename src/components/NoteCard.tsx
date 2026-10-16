import React from 'react';
import { 
  Star, 
  Eye, 
  Edit3, 
  Trash2, 
  Calendar, 
  GraduationCap, 
  Briefcase, 
  HeartHandshake,
  Pin
} from 'lucide-react';
import { Note, CATEGORIES_CONFIG, ViewMode } from '../types/note';

interface NoteCardProps {
  note: Note;
  viewMode: ViewMode;
  onView: (note: Note) => void;
  onEdit: (note: Note) => void;
  onDelete: (note: Note) => void;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  onTogglePin?: (id: string, e: React.MouseEvent) => void;
  searchQuery?: string;
}

export const NoteCard: React.FC<NoteCardProps> = ({
  note,
  viewMode,
  onView,
  onEdit,
  onDelete,
  onToggleFavorite,
  onTogglePin,
}) => {
  const categoryConfig = CATEGORIES_CONFIG[note.category];

  const getCategoryIcon = () => {
    switch (note.category) {
      case 'estudos':
        return <GraduationCap className="w-3.5 h-3.5" />;
      case 'trabalho':
        return <Briefcase className="w-3.5 h-3.5" />;
      case 'pessoal':
        return <HeartHandshake className="w-3.5 h-3.5" />;
    }
  };

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'Data indisponível';
    }
  };

  if (viewMode === 'list') {
    return (
      <div 
        onClick={() => onView(note)}
        className="group relative bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 sm:p-5 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-200 cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        tabIndex={0}
        role="button"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onView(note);
          }
        }}
        aria-label={`Anotação: ${note.title}, Categoria: ${categoryConfig.label}`}
      >
        <div className="flex-1 min-w-0 pr-2">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${categoryConfig.badgeClass}`}
            >
              {getCategoryIcon()}
              {categoryConfig.label}
            </span>

            {note.isPinned && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
                <Pin className="w-3 h-3 rotate-45" /> Fixada
              </span>
            )}

            <span className="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {formatDate(note.updatedAt)}
            </span>
          </div>

          <h3 className="text-base font-bold text-slate-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {note.title}
          </h3>

          <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-1 mt-1">
            {note.content}
          </p>
        </div>

        {/* Buttons */}
        <div 
          className="flex items-center gap-1 shrink-0 self-end sm:self-center"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={(e) => onToggleFavorite(note.id, e)}
            className={`p-2 rounded-xl transition-all cursor-pointer ${
              note.isFavorite
                ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/50 hover:bg-amber-100'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-amber-500'
            }`}
            title={note.isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
            aria-label={note.isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
          >
            <Star className={`w-4 h-4 ${note.isFavorite ? 'fill-amber-500' : ''}`} />
          </button>

          <button
            onClick={() => onView(note)}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-all cursor-pointer"
            title="Visualizar anotação completa"
            aria-label="Visualizar anotação"
          >
            <Eye className="w-4 h-4" />
          </button>

          <button
            onClick={() => onEdit(note)}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-all cursor-pointer"
            title="Editar anotação"
            aria-label="Editar anotação"
          >
            <Edit3 className="w-4 h-4" />
          </button>

          <button
            onClick={() => onDelete(note)}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all cursor-pointer"
            title="Excluir anotação"
            aria-label="Excluir anotação"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // Grid Card View
  return (
    <div
      onClick={() => onView(note)}
      className="group relative bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 hover:border-blue-300 dark:hover:border-blue-700/80 hover:shadow-xl hover:shadow-blue-600/5 transition-all duration-200 flex flex-col justify-between cursor-pointer"
      tabIndex={0}
      role="button"
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onView(note);
        }
      }}
      aria-label={`Anotação: ${note.title}, Categoria: ${categoryConfig.label}`}
    >
      <div>
        {/* Card Header: Category & Top Badges */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${categoryConfig.badgeClass}`}
          >
            {getCategoryIcon()}
            {categoryConfig.label}
          </span>

          <div 
            className="flex items-center gap-1"
            onClick={(e) => e.stopPropagation()}
          >
            {onTogglePin && (
              <button
                onClick={(e) => onTogglePin(note.id, e)}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  note.isPinned 
                    ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50' 
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
                title={note.isPinned ? 'Desafixar do topo' : 'Fixar no topo'}
                aria-label={note.isPinned ? 'Desafixar do topo' : 'Fixar no topo'}
              >
                <Pin className={`w-3.5 h-3.5 ${note.isPinned ? 'rotate-45 fill-blue-600 dark:fill-blue-400' : ''}`} />
              </button>
            )}

            <button
              onClick={(e) => onToggleFavorite(note.id, e)}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                note.isFavorite
                  ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/50 hover:bg-amber-100'
                  : 'text-slate-500 dark:text-slate-400 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              title={note.isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
              aria-label={note.isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
            >
              <Star className={`w-4 h-4 ${note.isFavorite ? 'fill-amber-500' : ''}`} />
            </button>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white line-clamp-2 mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {note.title}
        </h3>

        {/* Content Preview */}
        <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed mb-4 whitespace-pre-line font-normal">
          {note.content}
        </p>
      </div>

      {/* Card Footer: Timestamp & Action Buttons */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2 mt-auto">
        <span className="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-1 truncate">
          <Calendar className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">{formatDate(note.updatedAt)}</span>
        </span>

        {/* Action Buttons */}
        <div 
          className="flex items-center gap-1 shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => onView(note)}
            className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors cursor-pointer"
            title="Visualizar anotação completa"
            aria-label="Visualizar anotação"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => onEdit(note)}
            className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors cursor-pointer"
            title="Editar anotação"
            aria-label="Editar anotação"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(note)}
            className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
            title="Excluir anotação"
            aria-label="Excluir anotação"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
