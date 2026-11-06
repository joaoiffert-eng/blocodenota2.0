import React, { useState } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  Download, 
  FolderArchive, 
  FileCode, 
  Code2, 
  Smartphone,
  Coffee,
  Terminal,
  Layers,
  Sparkles
} from 'lucide-react';
import { JAVA_PROJECT_FILES, JavaProjectFile } from '../data/javaCodeFiles';
import JSZip from 'jszip';

interface JavaCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (msg: string, type?: 'success' | 'info') => void;
}

export const JavaCodeModal: React.FC<JavaCodeModalProps> = ({
  isOpen,
  onClose,
  onShowToast,
}) => {
  const [selectedFile, setSelectedFile] = useState<JavaProjectFile>(JAVA_PROJECT_FILES[0]);
  const [activeCategory, setActiveCategory] = useState<'all' | 'pure_java' | 'android'>('all');
  const [copied, setCopied] = useState(false);
  const [isZipping, setIsZipping] = useState(false);

  if (!isOpen) return null;

  const filteredFiles = JAVA_PROJECT_FILES.filter((f) => {
    if (activeCategory === 'pure_java') return f.category === 'pure_java';
    if (activeCategory === 'android') return f.category === 'android';
    return true;
  });

  const handleCopyCode = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    onShowToast(`Código de ${selectedFile.name} copiado com sucesso!`, 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSingleFile = (fileToDownload: JavaProjectFile = selectedFile) => {
    const blob = new Blob([fileToDownload.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileToDownload.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    onShowToast(`Download de ${fileToDownload.name} concluído!`, 'info');
  };

  const handleDownloadZip = async () => {
    try {
      setIsZipping(true);
      const zip = new JSZip();

      // README com instruções detalhadas
      zip.file(
        'README.txt',
        `==============================================================================
BLOCO DE NOTAS MODERNO & ACESSÍVEL EM JAVA (CELULAR E ANDROID)
==============================================================================

Este pacote contém 2 formas de utilizar o aplicativo em Java:

------------------------------------------------------------------------------
OPÇÃO 1: JAVA PURO EXECUTÁVEL (BlocoDeNotasApp.java)
------------------------------------------------------------------------------
Arquivo autônomo com interface gráfica idêntica a um celular (Swing/AWT),
com suporte a modo escuro, categorias, favoritos, pesquisa e salvamento local.

Como executar em qualquer computador com Java instalado:
  1. Abra o terminal na pasta deste arquivo.
  2. Compile:
       javac BlocoDeNotasApp.java
  3. Execute:
       java BlocoDeNotasApp

------------------------------------------------------------------------------
OPÇÃO 2: PROJETO NATIVO ANDROID STUDIO (PASTA app/)
------------------------------------------------------------------------------
Código Java completo para criar o aplicativo nativo (.APK) para instalar
no celular Android:
  - Model: Note.java
  - Database: NoteDatabaseHelper.java (SQLite Local)
  - Activities: MainActivity.java, NoteEditorActivity.java, NoteViewerActivity.java
  - Adapter: NoteAdapter.java
  - Layouts XML com Material Design: activity_main.xml, activity_editor.xml,
    activity_viewer.xml, item_note.xml, colors.xml
  - AndroidManifest.xml e build.gradle prontos

Como abrir no Android Studio:
  1. Abra o Android Studio e escolha "Open" ou importe a pasta.
  2. Clique no botão "Run" (ícone verde de play) para rodar no seu celular via USB
     ou no Emulador.
  3. Para gerar o instalador do celular, vá em Build > Build Bundle(s) / APK(s) > Build APK(s).
==============================================================================
`
      );

      // Adicionar todos os arquivos com os caminhos corretos
      JAVA_PROJECT_FILES.forEach((f) => {
        zip.file(f.path, f.content);
      });

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'BlocoDeNotas_Completo_Java.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      onShowToast('Pacote completo em Java (.ZIP) baixado com sucesso!', 'success');
    } catch (err) {
      console.error(err);
      onShowToast('Erro ao compactar o arquivo zip.', 'info');
    } finally {
      setIsZipping(false);
    }
  };

  const pureJavaFile = JAVA_PROJECT_FILES.find((f) => f.name === 'BlocoDeNotasApp.java') || JAVA_PROJECT_FILES[0];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-5 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="java-modal-title"
    >
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-5xl w-full h-[92vh] flex flex-col shadow-2xl text-slate-100 overflow-hidden">
        
        {/* Modal Header */}
        <div className="px-4 sm:px-6 py-3.5 border-b border-slate-800 flex items-center justify-between gap-3 bg-slate-900/95 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-red-500 flex items-center justify-center text-white shadow-md shadow-orange-500/20 shrink-0">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 id="java-modal-title" className="text-sm sm:text-base font-bold text-white leading-tight">
                  Código do Bloco de Notas em Java
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  Java Puro & Android Nativo
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Toda a lógica foi estruturada em Java: baixe o arquivo individual ou o projeto completo (.ZIP)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Quick Download BlocoDeNotasApp.java */}
            <button
              onClick={() => handleDownloadSingleFile(pureJavaFile)}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-amber-950 bg-amber-400 hover:bg-amber-300 transition-all shadow-sm active:scale-95 cursor-pointer"
              title="Baixar apenas o arquivo BlocoDeNotasApp.java executável"
            >
              <Coffee className="w-3.5 h-3.5 text-amber-900" />
              <span>Baixar BlocoDeNotasApp.java</span>
            </button>

            {/* Download Full ZIP */}
            <button
              onClick={handleDownloadZip}
              disabled={isZipping}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 transition-all active:scale-95 shadow-md shadow-emerald-600/20 cursor-pointer disabled:opacity-50"
            >
              <FolderArchive className="w-4 h-4" />
              <span>Baixar Tudo (.ZIP)</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Fechar modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick Instructions Banner */}
        <div className="px-4 py-2 bg-slate-950/60 border-b border-slate-800/80 flex items-center justify-between gap-3 text-xs shrink-0 flex-wrap">
          <div className="flex items-center gap-2 text-slate-300">
            <Terminal className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Como rodar via terminal:</span>
            <code className="px-2 py-0.5 bg-slate-800 rounded font-mono text-emerald-400 text-[11px] select-all">
              javac BlocoDeNotasApp.java && java BlocoDeNotasApp
            </code>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400">Filtrar:</span>
            <div className="inline-flex p-0.5 rounded-lg bg-slate-800 text-[11px]">
              <button
                onClick={() => setActiveCategory('all')}
                className={`px-2 py-0.5 rounded-md font-semibold transition-all cursor-pointer ${
                  activeCategory === 'all' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Todos ({JAVA_PROJECT_FILES.length})
              </button>
              <button
                onClick={() => setActiveCategory('pure_java')}
                className={`px-2 py-0.5 rounded-md font-semibold transition-all cursor-pointer ${
                  activeCategory === 'pure_java' ? 'bg-amber-500 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                ☕ Java Puro
              </button>
              <button
                onClick={() => setActiveCategory('android')}
                className={`px-2 py-0.5 rounded-md font-semibold transition-all cursor-pointer ${
                  activeCategory === 'android' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                📱 Android Studio
              </button>
            </div>
          </div>
        </div>

        {/* Modal Body: Sidebar with Files + Code Viewer */}
        <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
          
          {/* Files Sidebar */}
          <div className="w-full md:w-72 bg-slate-950/80 border-b md:border-b-0 md:border-r border-slate-800/80 p-2.5 overflow-y-auto shrink-0 flex md:flex-col gap-1 max-h-36 md:max-h-full">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-2 py-1 hidden md:block">
              Arquivos ({filteredFiles.length})
            </span>
            {filteredFiles.map((file) => {
              const isSelected = selectedFile.name === file.name;
              return (
                <button
                  key={file.name}
                  onClick={() => setSelectedFile(file)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-left transition-all shrink-0 md:w-full cursor-pointer ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-bold'
                      : 'text-slate-300 hover:bg-slate-800/80 hover:text-white font-medium'
                  }`}
                >
                  {file.name.endsWith('.java') ? (
                    <Coffee className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-white' : 'text-amber-400'}`} />
                  ) : (
                    <FileCode className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-white' : 'text-blue-400'}`} />
                  )}
                  <span className="truncate">{file.name}</span>
                </button>
              );
            })}
          </div>

          {/* Code Viewer */}
          <div className="flex-1 flex flex-col min-h-0 bg-slate-900">
            {/* File info bar */}
            <div className="px-4 py-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between gap-3 text-xs shrink-0">
              <div className="truncate">
                <span className="font-mono text-blue-400 font-semibold">{selectedFile.path}</span>
                <p className="text-[11px] text-slate-400 truncate mt-0.5">{selectedFile.description}</p>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={handleCopyCode}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-all cursor-pointer font-medium active:scale-95"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copiado!' : 'Copiar'}</span>
                </button>

                <button
                  onClick={() => handleDownloadSingleFile(selectedFile)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-all cursor-pointer font-medium active:scale-95"
                  title="Baixar apenas este arquivo"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="hidden sm:inline">Baixar Arquivo</span>
                </button>
              </div>
            </div>

            {/* Code Content Box */}
            <div className="flex-1 overflow-auto p-4 font-mono text-xs text-slate-200 bg-slate-950/90 leading-relaxed selection:bg-blue-600 selection:text-white">
              <pre className="whitespace-pre">
                <code>{selectedFile.content}</code>
              </pre>
            </div>

          </div>

        </div>

        {/* Modal Footer with quick instructions */}
        <div className="px-5 py-2.5 border-t border-slate-800 bg-slate-950/90 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400 shrink-0">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Formato Celular • Categorias (Estudos, Trabalho, Pessoal) • Modo Escuro • SQLite / Arquivo Local</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-amber-400 font-semibold">100% Java</span>
          </div>
        </div>

      </div>
    </div>
  );
};
