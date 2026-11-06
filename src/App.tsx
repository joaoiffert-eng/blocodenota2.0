import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  getStoredNotes, 
  saveStoredNotes, 
  getStoredTheme, 
  saveStoredTheme, 
  getStoredTextSize, 
  saveStoredTextSize,
  exportNotesToFile 
} from './utils/storage';
import { 
  Note, 
  FilterCategory, 
  SortOption, 
  ViewMode, 
  TextSize, 
  NoteCategory 
} from './types/note';
import { Header } from './components/Header';
import { MobileHeader } from './components/MobileHeader';
import { MobileBottomNav } from './components/MobileBottomNav';
import { PhoneSimulator } from './components/PhoneSimulator';
import { CategoryPills } from './components/CategoryPills';
import { NoteCard } from './components/NoteCard';
import { NoteEditor } from './components/NoteEditor';
import { NoteViewer } from './components/NoteViewer';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { ExitConfirmModal } from './components/ExitConfirmModal';
import { EmptyState } from './components/EmptyState';
import { Toast, ToastMessage } from './components/Toast';
import { JavaCodeModal } from './components/JavaCodeModal';
import { InstallModal } from './components/InstallModal';
import { usePWAInstall } from './hooks/usePWAInstall';
import { 
  Plus, 
  RefreshCw, 
  ShieldCheck, 
  Download,
  X,
  Smartphone
} from 'lucide-react';

export default function App() {
  // Mobile Frame View Mode (defaults to true as requested: "em formato de celular eu quero")
  const [isPhoneMode, setIsPhoneMode] = useState(true);
  const [isJavaModalOpen, setIsJavaModalOpen] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [showInstallBanner, setShowInstallBanner] = useState(true);

  // PWA install status
  const { isInstalled, isInstallable } = usePWAInstall();

  // Core Data
  const [notes, setNotes] = useState<Note[]>(() => getStoredNotes());
  const [currentView, setCurrentView] = useState<'list-view' | 'editor-view' | 'reader-view' | 'exit-screen'>('list-view');
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);

  // Filters & Controls
  const [searchQuery, setSearchQuery] = useState('');
  const [currentFilter, setCurrentFilter] = useState<FilterCategory>('todas');
  const [sortOption, setSortOption] = useState<SortOption>('updated-desc');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  // Accessibility & Theme
  const [darkMode, setDarkMode] = useState<boolean>(() => getStoredTheme() === 'dark');
  const [textSize, setTextSize] = useState<TextSize>(() => getStoredTextSize());

  // Modals & Notifications
  const [noteToDelete, setNoteToDelete] = useState<Note | null>(null);
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync dark mode class on document element & body
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
      saveStoredTheme('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
      saveStoredTheme('light');
    }
  }, [darkMode]);

  // Persist notes
  useEffect(() => {
    saveStoredNotes(notes);
  }, [notes]);

  // Persist text size
  useEffect(() => {
    saveStoredTextSize(textSize);
  }, [textSize]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 6);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleToggleTheme = () => {
    setDarkMode(!darkMode);
    showToast(!darkMode ? 'Modo escuro ativado' : 'Modo claro ativado', 'info');
  };

  const handleCycleTextSize = () => {
    if (textSize === 'normal') {
      setTextSize('large');
      showToast('Texto ampliado (Grande)', 'info');
    } else if (textSize === 'large') {
      setTextSize('xlarge');
      showToast('Texto ampliado (Extra Grande)', 'info');
    } else {
      setTextSize('normal');
      showToast('Tamanho normal de texto', 'info');
    }
  };

  // Actions: Notes
  const handleNewNote = () => {
    setSelectedNote(null);
    setCurrentView('editor-view');
  };

  const handleEditNote = (note: Note) => {
    setSelectedNote(note);
    setCurrentView('editor-view');
  };

  const handleViewNote = (note: Note) => {
    setSelectedNote(note);
    setCurrentView('reader-view');
  };

  const handleSaveNote = (noteData: {
    title: string;
    content: string;
    category: NoteCategory;
    isFavorite: boolean;
    isPinned: boolean;
  }) => {
    const { title, content, category, isFavorite, isPinned } = noteData;
    const now = new Date().toISOString();

    if (selectedNote) {
      // Update existing
      const updatedNote: Note = {
        ...selectedNote,
        title,
        content,
        category,
        isFavorite,
        isPinned,
        updatedAt: now,
      };

      setNotes((prev) => prev.map((n) => (n.id === updatedNote.id ? updatedNote : n)));
      setSelectedNote(updatedNote);
      showToast('Anotação atualizada com sucesso!', 'success');
      setCurrentView('reader-view');
    } else {
      // Create new
      const newNote: Note = {
        id: 'note_' + Date.now().toString() + Math.random().toString(36).substring(2, 6),
        title,
        content,
        category,
        isFavorite,
        isPinned,
        createdAt: now,
        updatedAt: now,
      };

      setNotes((prev) => [newNote, ...prev]);
      setSelectedNote(newNote);
      showToast('Nova anotação criada com sucesso!', 'success');
      setCurrentView('reader-view');
    }
  };

  const handleDeleteTrigger = (note: Note) => {
    setNoteToDelete(note);
  };

  const handleConfirmDelete = () => {
    if (!noteToDelete) return;
    setNotes((prev) => prev.filter((n) => n.id !== noteToDelete.id));
    showToast(`"${noteToDelete.title}" foi excluída.`, 'info');
    setNoteToDelete(null);
    if (selectedNote?.id === noteToDelete.id) {
      setSelectedNote(null);
      setCurrentView('list-view');
    }
  };

  const handleToggleFavorite = (noteId: string) => {
    setNotes((prev) =>
      prev.map((n) => {
        if (n.id === noteId) {
          const nextFav = !n.isFavorite;
          showToast(nextFav ? 'Adicionado aos favoritos' : 'Removido dos favoritos', 'info');
          return { ...n, isFavorite: nextFav, updatedAt: new Date().toISOString() };
        }
        return n;
      })
    );

    if (selectedNote && selectedNote.id === noteId) {
      setSelectedNote((prev) => (prev ? { ...prev, isFavorite: !prev.isFavorite } : null));
    }
  };

  const handleTogglePin = (noteId: string) => {
    setNotes((prev) =>
      prev.map((n) => {
        if (n.id === noteId) {
          const nextPin = !n.isPinned;
          showToast(nextPin ? 'Anotação fixada no topo' : 'Anotação desfixada', 'info');
          return { ...n, isPinned: nextPin, updatedAt: new Date().toISOString() };
        }
        return n;
      })
    );

    if (selectedNote && selectedNote.id === noteId) {
      setSelectedNote((prev) => (prev ? { ...prev, isPinned: !prev.isPinned } : null));
    }
  };

  // Backup handlers
  const handleExportBackup = () => {
    exportNotesToFile(notes);
    showToast('Backup exportado com sucesso!', 'success');
  };

  const handleImportBackup = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target?.result as string);
        if (Array.isArray(parsed)) {
          setNotes(parsed);
          showToast(`${parsed.length} anotações restauradas com sucesso!`, 'success');
        } else {
          showToast('Arquivo de backup inválido.', 'error');
        }
      } catch (err) {
        console.error(err);
        showToast('Erro ao ler arquivo de backup.', 'error');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const handleConfirmExit = () => {
    setIsExitModalOpen(false);
    setCurrentView('exit-screen');
  };

  // Filtered & Sorted Notes
  const filteredNotes = useMemo(() => {
    let result = [...notes];

    // Filter by category or favorite
    if (currentFilter === 'favoritos') {
      result = result.filter((n) => n.isFavorite);
    } else if (currentFilter !== 'todas') {
      result = result.filter((n) => n.category === currentFilter);
    }

    // Filter by search query (title or content)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (n) => n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q)
      );
    }

    // Sorting
    result.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;

      if (sortOption === 'updated-desc') {
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      } else if (sortOption === 'updated-asc') {
        return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
      } else if (sortOption === 'title-asc') {
        return a.title.localeCompare(b.title, 'pt-BR');
      } else if (sortOption === 'title-desc') {
        return b.title.localeCompare(a.title, 'pt-BR');
      }
      return 0;
    });

    return result;
  }, [notes, currentFilter, searchQuery, sortOption]);

  const textSizeClass =
    textSize === 'xlarge'
      ? 'text-[1.125rem]'
      : textSize === 'large'
      ? 'text-[1.05rem]'
      : 'text-sm sm:text-base';

  // If user confirmed exit, render peaceful exit view
  if (currentView === 'exit-screen') {
    return (
      <PhoneSimulator
        isPhoneMode={isPhoneMode}
        darkMode={darkMode}
        onTogglePhoneMode={() => setIsPhoneMode(!isPhoneMode)}
        onOpenJavaModal={() => setIsJavaModalOpen(true)}
        onOpenInstallModal={() => setIsInstallModalOpen(true)}
      >
        <div className="h-full bg-slate-900 text-slate-100 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-500 via-indigo-500 to-purple-500 flex items-center justify-center text-white mb-4 shadow-lg shadow-blue-500/30">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold mb-2 text-white">App Encerrado</h2>
          <p className="text-slate-300 text-xs sm:text-sm mb-6 leading-relaxed max-w-xs">
            Suas {notes.length} anotações continuam salvas no dispositivo com segurança via SQLite/armazenamento local.
          </p>
          <button
            onClick={() => setCurrentView('list-view')}
            className="w-full max-w-xs inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-600/30 transition-all active:scale-95 cursor-pointer text-sm"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reabrir Bloco de Notas</span>
          </button>
        </div>
      </PhoneSimulator>
    );
  }

  // Inside Phone Screen Content (Mobile Viewport)
  const phoneScreenContent = (
    <div className={`h-full flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-200 relative ${textSizeClass} ${darkMode ? 'dark' : ''}`}>
      
      {/* Top Mobile App Bar */}
      <MobileHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        darkMode={darkMode}
        onToggleTheme={handleToggleTheme}
        textSize={textSize}
        onCycleTextSize={handleCycleTextSize}
        onOpenJavaModal={() => setIsJavaModalOpen(true)}
        onOpenInstallModal={() => setIsInstallModalOpen(true)}
        onOpenExitModal={() => setIsExitModalOpen(true)}
      />

      {/* Main Scrollable View */}
      <div className="flex-1 overflow-y-auto px-3.5 py-3 relative">
        {currentView === 'editor-view' ? (
          <NoteEditor
            note={selectedNote}
            onSave={handleSaveNote}
            onBack={() => {
              if (selectedNote) {
                setCurrentView('reader-view');
              } else {
                setCurrentView('list-view');
              }
            }}
          />
        ) : currentView === 'reader-view' && selectedNote ? (
          <NoteViewer
            note={selectedNote}
            onBack={() => setCurrentView('list-view')}
            onEdit={handleEditNote}
            onDelete={handleDeleteTrigger}
            onToggleFavorite={handleToggleFavorite}
            onTogglePin={handleTogglePin}
            onShowToast={showToast}
          />
        ) : (
          <div>
            {/* Install Prompt Banner (Prominent & Clear) */}
            {showInstallBanner && !isInstalled && (
              <div className="mb-3 p-2.5 rounded-2xl bg-gradient-to-r from-emerald-500/15 via-blue-500/10 to-purple-500/10 border border-emerald-500/30 dark:border-emerald-500/40 flex items-center justify-between gap-2 shadow-xs shrink-0 animate-in fade-in duration-150">
                <div className="flex items-center gap-2 overflow-hidden">
                  <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Download className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                      Instalar no Celular
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                      Ícone na tela inicial e funciona 100% offline
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => setIsInstallModalOpen(true)}
                    className="px-2.5 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold shadow-xs active:scale-95 transition-all cursor-pointer"
                  >
                    Instalar
                  </button>
                  <button
                    onClick={() => setShowInstallBanner(false)}
                    className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                    aria-label="Dispensar aviso de instalação"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Quick Category Filter Badges */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-3 scrollbar-none">
              <button
                onClick={() => setCurrentFilter('todas')}
                className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all border cursor-pointer ${
                  currentFilter === 'todas'
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-transparent shadow-sm'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800'
                }`}
              >
                Todas ({notes.length})
              </button>

              <button
                onClick={() => setCurrentFilter('estudos')}
                className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all border cursor-pointer ${
                  currentFilter === 'estudos'
                    ? 'bg-blue-600 text-white border-transparent shadow-sm shadow-blue-500/20'
                    : 'bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-900'
                }`}
              >
                Estudos ({notes.filter((n) => n.category === 'estudos').length})
              </button>

              <button
                onClick={() => setCurrentFilter('trabalho')}
                className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all border cursor-pointer ${
                  currentFilter === 'trabalho'
                    ? 'bg-emerald-600 text-white border-transparent shadow-sm shadow-emerald-500/20'
                    : 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900'
                }`}
              >
                Trabalho ({notes.filter((n) => n.category === 'trabalho').length})
              </button>

              <button
                onClick={() => setCurrentFilter('pessoal')}
                className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all border cursor-pointer ${
                  currentFilter === 'pessoal'
                    ? 'bg-purple-600 text-white border-transparent shadow-sm shadow-purple-500/20'
                    : 'bg-white dark:bg-slate-900 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-900'
                }`}
              >
                Pessoal ({notes.filter((n) => n.category === 'pessoal').length})
              </button>
            </div>

            {/* Note Cards List */}
            {filteredNotes.length === 0 ? (
              <EmptyState
                searchQuery={searchQuery}
                currentFilter={currentFilter}
                onClearSearch={() => setSearchQuery('')}
                onNewNote={handleNewNote}
              />
            ) : (
              <div className="flex flex-col gap-2.5 pb-16">
                {filteredNotes.map((note) => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    viewMode="grid"
                    onView={handleViewNote}
                    onEdit={handleEditNote}
                    onDelete={handleDeleteTrigger}
                    onToggleFavorite={handleToggleFavorite}
                    onTogglePin={handleTogglePin}
                    searchQuery={searchQuery}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Floating Action Button (FAB) for Nova Anotação */}
      {currentView === 'list-view' && (
        <button
          onClick={handleNewNote}
          className="absolute right-4 bottom-18 w-13 h-13 rounded-full bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 text-white shadow-xl shadow-blue-600/40 flex items-center justify-center transition-all hover:scale-105 active:scale-95 z-30 cursor-pointer"
          title="Criar Nova Anotação"
          aria-label="Nova Anotação"
        >
          <Plus className="w-6 h-6 stroke-[2.5]" />
        </button>
      )}

      {/* Mobile Bottom Navigation Tabs */}
      {currentView === 'list-view' && (
        <MobileBottomNav
          currentFilter={currentFilter}
          onSelectFilter={setCurrentFilter}
          notes={notes}
        />
      )}

      {/* Modals inside screen */}
      <DeleteConfirmModal
        note={noteToDelete}
        isOpen={Boolean(noteToDelete)}
        onConfirm={handleConfirmDelete}
        onCancel={() => setNoteToDelete(null)}
      />

      <ExitConfirmModal
        isOpen={isExitModalOpen}
        totalNotes={notes.length}
        onConfirmExit={handleConfirmExit}
        onCancel={() => setIsExitModalOpen(false)}
      />
    </div>
  );

  // Responsive Full Screen Content (Desktop / Tablet)
  const fullScreenContent = (
    <div className={`min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-200 flex flex-col ${textSizeClass} ${darkMode ? 'dark' : ''}`}>
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onNewNote={handleNewNote}
        darkMode={darkMode}
        onToggleTheme={handleToggleTheme}
        textSize={textSize}
        onCycleTextSize={handleCycleTextSize}
        onOpenExitModal={() => setIsExitModalOpen(true)}
        onExportBackup={handleExportBackup}
        onImportBackup={handleImportBackup}
        fileInputRef={fileInputRef}
        onOpenInstallModal={() => setIsInstallModalOpen(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentView === 'editor-view' ? (
          <NoteEditor
            note={selectedNote}
            onSave={handleSaveNote}
            onBack={() => {
              if (selectedNote) {
                setCurrentView('reader-view');
              } else {
                setCurrentView('list-view');
              }
            }}
          />
        ) : currentView === 'reader-view' && selectedNote ? (
          <NoteViewer
            note={selectedNote}
            onBack={() => setCurrentView('list-view')}
            onEdit={handleEditNote}
            onDelete={handleDeleteTrigger}
            onToggleFavorite={handleToggleFavorite}
            onTogglePin={handleTogglePin}
            onShowToast={showToast}
          />
        ) : (
          <div className="space-y-6">
            {/* Install Prompt Banner */}
            {showInstallBanner && !isInstalled && (
              <div className="p-4 rounded-3xl bg-gradient-to-r from-emerald-500/10 via-blue-500/10 to-purple-500/10 border border-emerald-500/25 dark:border-emerald-500/35 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm animate-in fade-in duration-150">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-600/20">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      Instale o Bloco de Notas no seu Celular
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      Use direto da tela inicial do seu smartphone (Android ou iPhone) com funcionamento 100% offline.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setIsInstallModalOpen(true)}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
                  >
                    <Download className="w-4 h-4" />
                    <span>Ver Como Instalar</span>
                  </button>
                  <button
                    onClick={() => setShowInstallBanner(false)}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                    aria-label="Dispensar aviso"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Filter and Sort bar */}
            <CategoryPills
              currentFilter={currentFilter}
              onSelectFilter={setCurrentFilter}
              sortOption={sortOption}
              onSortChange={setSortOption}
              viewMode={viewMode}
              onToggleViewMode={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              notes={notes}
            />

            {/* Notes display */}
            {filteredNotes.length === 0 ? (
              <EmptyState
                searchQuery={searchQuery}
                currentFilter={currentFilter}
                onClearSearch={() => setSearchQuery('')}
                onNewNote={handleNewNote}
              />
            ) : (
              <div
                className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6'
                    : 'flex flex-col gap-3 max-w-4xl mx-auto'
                }
              >
                {filteredNotes.map((note) => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    viewMode={viewMode}
                    onView={handleViewNote}
                    onEdit={handleEditNote}
                    onDelete={handleDeleteTrigger}
                    onToggleFavorite={handleToggleFavorite}
                    onTogglePin={handleTogglePin}
                    searchQuery={searchQuery}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Modals for Desktop */}
      <DeleteConfirmModal
        note={noteToDelete}
        isOpen={Boolean(noteToDelete)}
        onConfirm={handleConfirmDelete}
        onCancel={() => setNoteToDelete(null)}
      />

      <ExitConfirmModal
        isOpen={isExitModalOpen}
        totalNotes={notes.length}
        onConfirmExit={handleConfirmExit}
        onCancel={() => setIsExitModalOpen(false)}
      />
    </div>
  );

  return (
    <>
      <PhoneSimulator
        isPhoneMode={isPhoneMode}
        darkMode={darkMode}
        onTogglePhoneMode={() => setIsPhoneMode(!isPhoneMode)}
        onOpenJavaModal={() => setIsJavaModalOpen(true)}
        onOpenInstallModal={() => setIsInstallModalOpen(true)}
      >
        {isPhoneMode ? phoneScreenContent : fullScreenContent}
      </PhoneSimulator>

      {/* Java Code Modal */}
      <JavaCodeModal
        isOpen={isJavaModalOpen}
        onClose={() => setIsJavaModalOpen(false)}
        onShowToast={showToast}
      />

      {/* Install Mobile PWA Modal */}
      <InstallModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
        onOpenJavaModal={() => setIsJavaModalOpen(true)}
        onShowToast={showToast}
      />

      {/* Global Toast notifications */}
      <Toast toasts={toasts} onDismiss={dismissToast} />
    </>
  );
}
