import React, { useEffect, useState } from 'react';
import { 
  ArrowLeft, 
  Edit3, 
  Trash2, 
  Star, 
  Copy, 
  Check, 
  Download, 
  Printer, 
  GraduationCap, 
  Briefcase, 
  HeartHandshake, 
  Calendar, 
  Clock, 
  Share2,
  Pin
} from 'lucide-react';
import { Note, CATEGORIES_CONFIG } from '../types/note';
import { exportSingleNoteAsTxt } from '../utils/storage';

interface NoteViewerProps {
  note: Note;
  onBack: () => void;
  onEdit: (note: Note) => void;
  onDelete: (note: Note) => void;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  onTogglePin?: (id: string, e: React.MouseEvent) => void;
  onShowToast: (message: string, type?: 'success' | 'info') => void;
}

export const NoteViewer: React.FC<NoteViewerProps> = ({
  note,
  onBack,
  onEdit,
  onDelete,
  onToggleFavorite,
  onTogglePin,
  onShowToast,
}) => {
  const [copied, setCopied] = useState(false);
  const categoryConfig = CATEGORIES_CONFIG[note.category];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onBack();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onBack]);

  const handleCopyContent = () => {
    navigator.clipboard.writeText(`${note.title}\n\n${note.content}`);
    setCopied(true);
    onShowToast('Conteúdo copiado com sucesso!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadTxt = () => {
    exportSingleNoteAsTxt(note);
    onShowToast('Download do arquivo de texto iniciado!', 'info');
  };

  const handlePrint = () => {
    window.print();
  };

  const wordCount = note.content.trim() ? note.content.trim().split(/\s+/).length : 0;
  const readTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));

  const getCategoryIcon = () => {
    switch (note.category) {
      case 'estudos':
        return <GraduationCap className="w-4 h-4" />;
      case 'trabalho':
        return <Briefcase className="w-4 h-4" />;
      case 'pessoal':
        return <HeartHandshake className="w-4 h-4" />;
    }
  };

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('pt-BR', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '';
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-4 sm:py-6 animate-in fade-in duration-200">
      {/* Top Navigation & Action Controls */}
      <div className="flex items-center justify-between gap-3 mb-6 flex-wrap">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 transition-all active:scale-95 shadow-sm cursor-pointer"
          aria-label="Voltar para a lista de anotações"
        >
          <ArrowLeft className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span>Voltar</span>
        </button>

        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          {/* Pin toggle */}
          {onTogglePin && (
            <button
              onClick={(e) => onTogglePin(note.id, e)}
              className={`p-2 rounded-xl border transition-all cursor-pointer ${
                note.isPinned
                  ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
              }`}
              title={note.isPinned ? 'Desafixar do topo' : 'Fixar no topo'}
              aria-label={note.isPinned ? 'Desafixar do topo' : 'Fixar no topo'}
            >
              <Pin className={`w-4 h-4 ${note.isPinned ? 'rotate-45 fill-blue-600 dark:fill-blue-400' : ''}`} />
            </button>
          )}

          {/* Favorite toggle */}
          <button
            onClick={(e) => onToggleFavorite(note.id, e)}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              note.isFavorite
                ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800 text-amber-500'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
            }`}
            title={note.isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
            aria-label={note.isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
          >
            <Star className={`w-4 h-4 ${note.isFavorite ? 'fill-amber-500' : ''}`} />
          </button>

          {/* Copy content */}
          <button
            onClick={handleCopyContent}
            className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/80 transition-all cursor-pointer"
            title="Copiar texto para a área de transferência"
            aria-label="Copiar anotação"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
          </button>

          {/* Download TXT */}
          <button
            onClick={handleDownloadTxt}
            className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/80 transition-all cursor-pointer"
            title="Baixar como arquivo de texto (.txt)"
            aria-label="Baixar anotação em texto"
          >
            <Download className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </button>

          {/* Print */}
          <button
            onClick={handlePrint}
            className="hidden sm:flex p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/80 transition-all cursor-pointer"
            title="Imprimir anotação"
            aria-label="Imprimir anotação"
          >
            <Printer className="w-4 h-4" />
          </button>

          {/* Edit Button */}
          <button
            onClick={() => onEdit(note)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 shadow-md shadow-blue-600/20 transition-all cursor-pointer"
            aria-label="Editar anotação"
          >
            <Edit3 className="w-4 h-4" />
            <span>Editar</span>
          </button>

          {/* Delete Button */}
          <button
            onClick={() => onDelete(note)}
            className="p-2 rounded-xl text-rose-600 hover:text-rose-700 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-900/50 transition-all cursor-pointer"
            title="Excluir esta anotação"
            aria-label="Excluir anotação"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Reading Card */}
      <article className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl shadow-xl shadow-slate-200/40 dark:shadow-none p-6 sm:p-10">
        
        {/* Category & Metadata header */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${categoryConfig.badgeClass}`}
            >
              {getCategoryIcon()}
              {categoryConfig.label}
            </span>

            {note.isPinned && (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-0.5 rounded-full border border-blue-200 dark:border-blue-800">
                <Pin className="w-3 h-3 rotate-45" /> Anotação Fixada
              </span>
            )}

            {note.isFavorite && (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-2.5 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
                <Star className="w-3 h-3 fill-amber-500" /> Favorita
              </span>
            )}
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              ~{readTimeMinutes} min de leitura
            </span>
            <span>{wordCount} palavras</span>
          </div>
        </div>

        {/* Note Title */}
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-6 mb-4 tracking-tight leading-snug">
          {note.title}
        </h2>

        {/* Timestamp */}
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-8">
          <Calendar className="w-4 h-4 text-slate-400" />
          <span>Última modificação: <span className="capitalize">{formatDate(note.updatedAt)}</span></span>
        </div>

        {/* Note Content */}
        <div className="text-base sm:text-lg text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-wrap font-normal selection:bg-blue-200 dark:selection:bg-blue-900/60">
          {note.content}
        </div>

        {/* Bottom Card Footer */}
        <div className="mt-12 pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <div>
            <span>Criada originalmente em: {new Date(note.createdAt).toLocaleDateString('pt-BR')}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyContent}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors font-medium"
            >
              <Share2 className="w-3.5 h-3.5" />
              Compartilhar texto
            </button>
          </div>
        </div>

      </article>
    </div>
  );
};
