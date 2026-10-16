import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, 
  Save, 
  GraduationCap, 
  Briefcase, 
  HeartHandshake, 
  Star, 
  Bold, 
  Italic, 
  List, 
  CheckSquare, 
  Heading1, 
  Quote, 
  Clock,
  Pin
} from 'lucide-react';
import { Note, NoteCategory } from '../types/note';

interface NoteEditorProps {
  note: Note | null; // null means new note
  onSave: (noteData: {
    title: string;
    content: string;
    category: NoteCategory;
    isFavorite: boolean;
    isPinned: boolean;
  }) => void;
  onBack: () => void;
}

export const NoteEditor: React.FC<NoteEditorProps> = ({
  note,
  onSave,
  onBack,
}) => {
  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || '');
  const [category, setCategory] = useState<NoteCategory>(note?.category || 'estudos');
  const [isFavorite, setIsFavorite] = useState(note?.isFavorite || false);
  const [isPinned, setIsPinned] = useState(note?.isPinned || false);
  const [hasError, setHasError] = useState(false);
  const [showUnsavedPrompt, setShowUnsavedPrompt] = useState(false);

  const titleInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Focus title on mount if new note, or content if editing
  useEffect(() => {
    if (!note) {
      titleInputRef.current?.focus();
    }
  }, [note]);

  // Handle Ctrl+S / Cmd+S shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      } else if (e.key === 'Escape') {
        handleBackWithCheck();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [title, content, category, isFavorite, isPinned]);

  const isDirty = () => {
    if (!note) {
      return title.trim().length > 0 || content.trim().length > 0;
    }
    return (
      title !== note.title ||
      content !== note.content ||
      category !== note.category ||
      isFavorite !== note.isFavorite ||
      isPinned !== (note.isPinned || false)
    );
  };

  const handleBackWithCheck = () => {
    if (isDirty()) {
      setShowUnsavedPrompt(true);
    } else {
      onBack();
    }
  };

  const handleSave = () => {
    if (!title.trim()) {
      setHasError(true);
      titleInputRef.current?.focus();
      return;
    }
    setHasError(false);
    onSave({
      title: title.trim(),
      content,
      category,
      isFavorite,
      isPinned,
    });
  };

  // Quick text formatting helpers
  const insertFormatting = (prefix: string, suffix: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    const replacement = prefix + selectedText + suffix;

    const newContent = content.substring(0, start) + replacement + content.substring(end);
    setContent(newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + prefix.length,
        start + prefix.length + selectedText.length
      );
    }, 0);
  };

  const insertLinePrefix = (prefix: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const lineStart = content.lastIndexOf('\n', start - 1) + 1;
    
    const newContent = content.substring(0, lineStart) + prefix + content.substring(lineStart);
    setContent(newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, end + prefix.length);
    }, 0);
  };

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const charCount = content.length;

  return (
    <div className="max-w-4xl mx-auto py-4 sm:py-6 animate-in fade-in duration-200">
      {/* Top Bar Navigation & Actions */}
      <div className="flex items-center justify-between gap-3 mb-6">
        <button
          onClick={handleBackWithCheck}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 transition-all active:scale-95 shadow-sm cursor-pointer"
          aria-label="Voltar para a lista de anotações"
        >
          <ArrowLeft className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span>Voltar</span>
        </button>

        <div className="flex items-center gap-2">
          {/* Pin toggle */}
          <button
            onClick={() => setIsPinned(!isPinned)}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              isPinned
                ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
            }`}
            title={isPinned ? 'Desafixar do topo' : 'Fixar anotação no topo'}
            aria-label={isPinned ? 'Desafixar do topo' : 'Fixar anotação no topo'}
          >
            <Pin className={`w-4 h-4 ${isPinned ? 'rotate-45 fill-blue-600 dark:fill-blue-400' : ''}`} />
          </button>

          {/* Favorite toggle */}
          <button
            onClick={() => setIsFavorite(!isFavorite)}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              isFavorite
                ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800 text-amber-500'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
            }`}
            title={isFavorite ? 'Remover dos favoritos' : 'Marcar como favorita'}
            aria-label={isFavorite ? 'Remover dos favoritos' : 'Marcar como favorita'}
          >
            <Star className={`w-4 h-4 ${isFavorite ? 'fill-amber-500' : ''}`} />
          </button>

          {/* Save Button */}
          <button
            onClick={handleSave}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 active:scale-95 shadow-md shadow-emerald-600/20 transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-500"
            title="Salvar alterações (Ctrl+S)"
            aria-label="Salvar anotação"
          >
            <Save className="w-4 h-4" />
            <span>Salvar</span>
          </button>
        </div>
      </div>

      {/* Main Editor Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl shadow-xl shadow-slate-200/40 dark:shadow-none p-5 sm:p-8">
        
        {/* Category Selector */}
        <div className="mb-6">
          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
            Selecione a Categoria:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Estudos */}
            <button
              type="button"
              onClick={() => setCategory('estudos')}
              className={`flex items-center gap-3 p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                category === 'estudos'
                  ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-400 dark:border-blue-700 ring-2 ring-blue-500/20 text-blue-900 dark:text-blue-100 shadow-sm'
                  : 'bg-slate-50/70 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                category === 'estudos' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
              }`}>
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <span className="block text-sm font-bold">Estudos</span>
                <span className="block text-xs text-slate-500 dark:text-slate-400">Resumos, matérias e aulas</span>
              </div>
            </button>

            {/* Trabalho */}
            <button
              type="button"
              onClick={() => setCategory('trabalho')}
              className={`flex items-center gap-3 p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                category === 'trabalho'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-400 dark:border-emerald-700 ring-2 ring-emerald-500/20 text-emerald-900 dark:text-emerald-100 shadow-sm'
                  : 'bg-slate-50/70 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                category === 'trabalho' 
                  ? 'bg-emerald-600 text-white' 
                  : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300'
              }`}>
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <span className="block text-sm font-bold">Trabalho</span>
                <span className="block text-xs text-slate-500 dark:text-slate-400">Projetos, reuniões e metas</span>
              </div>
            </button>

            {/* Pessoal */}
            <button
              type="button"
              onClick={() => setCategory('pessoal')}
              className={`flex items-center gap-3 p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                category === 'pessoal'
                  ? 'bg-purple-50 dark:bg-purple-950/40 border-purple-400 dark:border-purple-700 ring-2 ring-purple-500/20 text-purple-900 dark:text-purple-100 shadow-sm'
                  : 'bg-slate-50/70 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                category === 'pessoal' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300'
              }`}>
                <HeartHandshake className="w-5 h-5" />
              </div>
              <div>
                <span className="block text-sm font-bold">Pessoal</span>
                <span className="block text-xs text-slate-500 dark:text-slate-400">Ideias, hábitos e livros</span>
              </div>
            </button>
          </div>
        </div>

        {/* Title Input */}
        <div className="mb-4">
          <label htmlFor="note-title" className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
            Título da Anotação <span className="text-rose-500">*</span>
          </label>
          <input
            id="note-title"
            ref={titleInputRef}
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (e.target.value.trim()) setHasError(false);
            }}
            placeholder="Ex: Resumo de Química Orgânica, Metas do Trimestre..."
            className={`w-full px-4 py-3 rounded-2xl text-lg sm:text-xl font-bold bg-slate-50 dark:bg-slate-800 border text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none transition-all ${
              hasError
                ? 'border-rose-400 ring-2 ring-rose-400/20'
                : 'border-slate-200 dark:border-slate-700 focus:border-blue-400 dark:focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-400/20'
            }`}
          />
          {hasError && (
            <p className="text-xs text-rose-500 mt-1.5 font-medium flex items-center gap-1">
              Por favor, preencha o título da anotação para salvar.
            </p>
          )}
        </div>

        {/* Formatting Toolbar */}
        <div className="flex items-center gap-1 flex-wrap p-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/70 rounded-2xl mb-3">
          <span className="text-xs font-semibold text-slate-400 px-2 hidden sm:inline">Formatar:</span>
          <button
            type="button"
            onClick={() => insertFormatting('**', '**')}
            className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
            title="Negrito (**texto**)"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => insertFormatting('*', '*')}
            className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
            title="Itálico (*texto*)"
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => insertLinePrefix('# ')}
            className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
            title="Título (# )"
          >
            <Heading1 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => insertLinePrefix('• ')}
            className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
            title="Lista com marcadores"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => insertLinePrefix('[ ] ')}
            className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
            title="Lista de tarefas ([ ])"
          >
            <CheckSquare className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => insertLinePrefix('> ')}
            className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
            title="Citação (> )"
          >
            <Quote className="w-4 h-4" />
          </button>
        </div>

        {/* Content Textarea */}
        <div className="mb-4">
          <label htmlFor="note-content" className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
            Conteúdo da Anotação
          </label>
          <textarea
            id="note-content"
            ref={textareaRef}
            rows={12}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Digite aqui o texto, ideias, anotações de aula, listas ou tarefas..."
            className="w-full px-4 py-3 rounded-2xl text-base bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-blue-400 dark:focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none leading-relaxed transition-all focus:ring-2 focus:ring-blue-400/20 resize-y"
          />
        </div>

        {/* Footer info: Counts & Shortcuts */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-4">
            <span><strong>{wordCount}</strong> palavras</span>
            <span><strong>{charCount}</strong> caracteres</span>
            {note && (
              <span className="flex items-center gap-1 text-slate-400">
                <Clock className="w-3.5 h-3.5" />
                Criado em: {new Date(note.createdAt).toLocaleDateString('pt-BR')}
              </span>
            )}
          </div>
          <span className="hidden sm:inline text-slate-400 dark:text-slate-500">
            Dica: Pressione <strong>Ctrl + S</strong> para salvar rapidamente
          </span>
        </div>

      </div>

      {/* Unsaved Changes Confirmation Modal */}
      {showUnsavedPrompt && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              Descartar alterações?
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
              Você tem modificações não salvas nesta anotação. Se sair agora, essas alterações serão perdidas.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowUnsavedPrompt(false)}
                className="px-4 py-2 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
              >
                Continuar Editando
              </button>
              <button
                onClick={() => {
                  setShowUnsavedPrompt(false);
                  onBack();
                }}
                className="px-4 py-2 rounded-xl text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 transition-all"
              >
                Descartar e Sair
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
