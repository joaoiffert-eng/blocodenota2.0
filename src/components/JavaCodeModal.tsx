import React, { useState } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  Download, 
  FolderArchive, 
  FileCode, 
  Code2, 
  ExternalLink,
  Smartphone,
  Layers
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
  const [copied, setCopied] = useState(false);
  const [isZipping, setIsZipping] = useState(false);

  if (!isOpen) return null;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    onShowToast(`Código de ${selectedFile.name} copiado com sucesso!`, 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSingleFile = () => {
    const blob = new Blob([selectedFile.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = selectedFile.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    onShowToast(`Download de ${selectedFile.name} concluído!`, 'info');
  };

  const handleDownloadZip = async () => {
    try {
      setIsZipping(true);
      const zip = new JSZip();

      // Add readme
      zip.file(
        'README.txt',
        `PROJETO ANDROID - BLOCO DE NOTAS MODERNO & ACESSÍVEL EM JAVA\n\nInstruções:\n1. Abra o Android Studio.\n2. Crie um novo projeto "Empty Views Activity" ou importe esta pasta.\n3. Copie os arquivos das pastas app/src/main/java e app/src/main/res.\n4. Execute no emulador ou conecte seu celular Android.\n`
      );

      // Add all files with their relative paths
      JAVA_PROJECT_FILES.forEach((f) => {
        zip.file(f.path, f.content);
      });

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'BlocoDeNotas_Android_Java.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      onShowToast('Projeto Android Java (.zip) baixado com sucesso!', 'success');
    } catch (err) {
      console.error(err);
      onShowToast('Erro ao compactar o arquivo zip.', 'info');
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-5xl w-full h-[90vh] flex flex-col shadow-2xl text-slate-100 overflow-hidden">
        
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between gap-3 bg-slate-900/90 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-md shadow-orange-500/20">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white">
                  Código Fonte do App em Java (Android)
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  Java + SQLite + Android Studio
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Arquivos 100% nativos prontos para compilar no Android Studio e rodar no seu celular
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadZip}
              disabled={isZipping}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 transition-all active:scale-95 shadow-md shadow-emerald-600/20 cursor-pointer disabled:opacity-50"
            >
              <FolderArchive className="w-4 h-4" />
              <span className="hidden sm:inline">Baixar Projeto Completo (.ZIP)</span>
              <span className="sm:hidden">Baixar .ZIP</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
              aria-label="Fechar modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body: Sidebar with Files + Code Viewer */}
        <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
          
          {/* Files Sidebar */}
          <div className="w-full md:w-72 bg-slate-950/70 border-b md:border-b-0 md:border-r border-slate-800/80 p-3 overflow-y-auto shrink-0 flex md:flex-col gap-1.5 max-h-36 md:max-h-full">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2 py-1 hidden md:block">
              Arquivos Java & Recursos
            </span>
            {JAVA_PROJECT_FILES.map((file) => {
              const isSelected = selectedFile.name === file.name;
              return (
                <button
                  key={file.name}
                  onClick={() => setSelectedFile(file)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-left transition-all shrink-0 md:w-full cursor-pointer ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-semibold'
                      : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                  }`}
                >
                  <FileCode className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-blue-400'}`} />
                  <span className="truncate">{file.name}</span>
                </button>
              );
            })}
          </div>

          {/* Code Viewer */}
          <div className="flex-1 flex flex-col min-h-0 bg-slate-900">
            {/* File info bar */}
            <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between gap-3 text-xs shrink-0">
              <div className="truncate">
                <span className="font-mono text-blue-400 font-semibold">{selectedFile.path}</span>
                <p className="text-[11px] text-slate-400 truncate mt-0.5">{selectedFile.description}</p>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={handleCopyCode}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-all cursor-pointer font-medium"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copiado!' : 'Copiar'}</span>
                </button>

                <button
                  onClick={handleDownloadSingleFile}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-all cursor-pointer font-medium"
                  title="Baixar apenas este arquivo"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="hidden sm:inline">Baixar</span>
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
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950/80 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400 shrink-0">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Compatível com Android 8.0 até Android 15 (minSdk 24, compileSdk 34)</span>
          </div>
          <div className="flex items-center gap-3">
            <span>Tecnologia: <strong>Java puro + SQLite nativo</strong></span>
          </div>
        </div>

      </div>
    </div>
  );
};
