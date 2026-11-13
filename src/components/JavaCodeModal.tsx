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
  Sparkles,
  ExternalLink,
  FolderTree,
  Play
} from 'lucide-react';
import { JAVA_PROJECT_FILES, JavaProjectFile } from '../data/javaCodeFiles';
import { ANDROID_BINARY_ASSETS } from '../data/androidBinaryAssets';
import JSZip from 'jszip';

interface JavaCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (msg: string, type?: 'success' | 'info') => void;
}

type CategoryType = 'all' | 'android_java' | 'android_res' | 'android_config';

export const JavaCodeModal: React.FC<JavaCodeModalProps> = ({
  isOpen,
  onClose,
  onShowToast,
}) => {
  const [selectedFile, setSelectedFile] = useState<JavaProjectFile>(
    JAVA_PROJECT_FILES.find((f) => f.name === 'MainActivity.java') || JAVA_PROJECT_FILES[0]
  );
  const [activeCategory, setActiveCategory] = useState<CategoryType>('all');
  const [copied, setCopied] = useState(false);
  const [isZipping, setIsZipping] = useState(false);

  if (!isOpen) return null;

  const filteredFiles = JAVA_PROJECT_FILES.filter((f) => {
    if (activeCategory === 'android_java') return f.category === 'android_java';
    if (activeCategory === 'android_res') return f.category === 'android_res';
    if (activeCategory === 'android_config') return f.category === 'android_config';
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

      // README com instruções detalhadas para o Android Studio
      zip.file(
        'INSTRUCOES_ANDROID_STUDIO.txt',
        `==============================================================================
BLOCO DE NOTAS MODERNO & ACESSÍVEL - PROJETO ANDROID STUDIO (JAVA)
==============================================================================

Como importar e rodar este projeto no Android Studio (Versões Iguana/Jellyfish/Koala/Ladybug+):

1. DESCOMPACTAR O ARQUIVO:
   Extraia todo o conteúdo deste arquivo .zip em uma pasta de sua preferência
   (por exemplo: C:\\Projetos\\BlocoDeNotas ou ~/Projetos/BlocoDeNotas).

2. ATENÇÃO AO ABRIR NO ANDROID STUDIO (PASSO MAIS IMPORTANTE):
   - Abra o Android Studio.
   - Na tela inicial, clique em "Open" (ou vá em File > Open).
   - Navegue até a pasta que contém DIRETAMENTE os arquivos 'settings.gradle'
     e 'build.gradle' (ATENÇÃO: se o Windows criar uma subpasta extra ao extrair
     o .zip, entre nela e selecione a pasta que possui o 'settings.gradle').
   - Clique em "OK".

3. SINCRONIZAÇÃO DO GRADLE:
   - O projeto está configurado com Gradle 8.7 e Android Gradle Plugin (AGP) 8.5.2,
     compatível com JDK 17 e JDK 21 (padrão das versões atuais do Android Studio).
   - Aguarde a barra inferior finalizar o "Gradle sync finished".

4. EXECUTAR NO CELULAR OU EMULADOR:
   - Conecte seu celular Android via cabo USB (com Depuração USB ativada)
     OU selecione um Emulador Virtual (AVD).
   - Clique no botão verde de "Run" (ícone de Play ▶ ou Shift + F10).

5. GERAR O ARQUIVO INSTALADOR .APK:
   - No menu superior do Android Studio, vá em:
     Build > Build Bundle(s) / APK(s) > Build APK(s)
   - Ao finalizar, clique em "locate" para pegar o arquivo 'app-debug.apk'.

==============================================================================
ESTRUTURA DOS ARQUIVOS INCLUÍDOS NO .ZIP:
==============================================================================
- settings.gradle                            -> Configuração de módulos e repositórios
- build.gradle                               -> AGP 8.5.2 (JDK 17/21)
- gradle.properties                          -> AndroidX habilitado
- gradle/wrapper/gradle-wrapper.properties   -> Wrapper Gradle 8.7
- .gitignore                                 -> Regras padrão Git Android Studio
- app/build.gradle                           -> SDK 34 (minSdk 24), Material + RecyclerView
- app/proguard-rules.pro                     -> Regras ProGuard/R8
- app/src/main/AndroidManifest.xml           -> Manifesto sem atributo package duplicado
- app/src/main/java/com/blocodenotas/app/
    ├── MainActivity.java                    -> Tela inicial, busca, abas e modo escuro
    ├── NoteEditorActivity.java              -> Criação/edição com categorias e formatação
    ├── NoteViewerActivity.java              -> Leitura, copiar, compartilhar, excluir
    ├── model/Note.java                      -> Modelo da anotação
    ├── database/NoteDatabaseHelper.java     -> Banco SQLite offline
    ├── adapter/NoteAdapter.java             -> Cartões modernos (Azul/Verde/Lilás)
    └── utils/PrefsManager.java              -> Tema escuro e tamanho de texto persistentes
- app/src/main/res/
    ├── layout/                              -> activity_main, activity_editor, activity_viewer, item_note
    ├── drawable/                            -> Formas arredondadas e 16 ícones vetoriais XML
    ├── mipmap-anydpi-v26/                   -> Ícones adaptativos (Android 8+)
    ├── mipmap-mdpi .. mipmap-xxxhdpi/       -> 10 ícones PNG de launcher em alta resolução
    ├── values/ & values-night/              -> colors.xml, strings.xml, themes.xml (Claro + Escuro)
    └── xml/                                 -> backup_rules.xml e data_extraction_rules.xml
==============================================================================
`
      );

      // Adicionar todos os arquivos de código, Gradle e XML
      JAVA_PROJECT_FILES.forEach((f) => {
        zip.file(f.path, f.content);
      });

      // Adicionar os ícones PNG reais nas pastas mipmap-*
      ANDROID_BINARY_ASSETS.forEach((asset) => {
        zip.file(asset.path, asset.base64, { base64: true });
      });

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'BlocoDeNotas_AndroidStudio_Java.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      onShowToast('Projeto Android Studio completo (.ZIP) baixado com sucesso!', 'success');
    } catch (err) {
      console.error(err);
      onShowToast('Erro ao compactar o arquivo zip.', 'info');
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-5 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="java-modal-title"
    >
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-5xl w-full h-[94vh] flex flex-col shadow-2xl text-slate-100 overflow-hidden">
        
        {/* Modal Header */}
        <div className="px-4 sm:px-6 py-3.5 border-b border-slate-800 flex items-center justify-between gap-3 bg-slate-900/95 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 shrink-0">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 id="java-modal-title" className="text-sm sm:text-base font-bold text-white leading-tight">
                  Projeto Pronto para Importar no Android Studio
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Linguagem Java • Gradle • SQLite
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Estrutura oficial do Android Studio com Gradle, Manifest, Activities Java e layouts XML
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Primary Action: Download Full Android Studio ZIP */}
            <button
              onClick={handleDownloadZip}
              disabled={isZipping}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 transition-all active:scale-95 shadow-md shadow-emerald-600/30 cursor-pointer disabled:opacity-50 ring-2 ring-emerald-500/20"
            >
              <FolderArchive className="w-4 h-4" />
              <span>{isZipping ? 'Compactando...' : 'Baixar Projeto Android Studio (.ZIP)'}</span>
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

        {/* Quick Android Studio Guide Step-by-Step */}
        <div className="px-4 py-2.5 bg-slate-950/70 border-b border-slate-800/80 shrink-0">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2 text-xs text-slate-300 flex-wrap">
              <span className="inline-flex items-center gap-1 font-bold text-emerald-400">
                <Play className="w-3.5 h-3.5 fill-emerald-400 text-emerald-400" />
                Como Importar:
              </span>
              <span>1. Baixe o <strong>.ZIP</strong> e extraia</span>
              <span className="text-slate-600">•</span>
              <span>2. No Android Studio: <strong>File &gt; Open</strong> na pasta do <strong>settings.gradle</strong></span>
              <span className="text-slate-600">•</span>
              <span>3. Clique em <strong>Run (▶)</strong></span>
            </div>

            {/* Category Filter Pills */}
            <div className="inline-flex p-0.5 rounded-lg bg-slate-800 text-[11px] shrink-0">
              <button
                onClick={() => setActiveCategory('all')}
                className={`px-2 py-0.5 rounded-md font-semibold transition-all cursor-pointer ${
                  activeCategory === 'all' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Todos ({JAVA_PROJECT_FILES.length})
              </button>
              <button
                onClick={() => setActiveCategory('android_java')}
                className={`px-2 py-0.5 rounded-md font-semibold transition-all cursor-pointer ${
                  activeCategory === 'android_java' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                ☕ Código Java
              </button>
              <button
                onClick={() => setActiveCategory('android_res')}
                className={`px-2 py-0.5 rounded-md font-semibold transition-all cursor-pointer ${
                  activeCategory === 'android_res' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                🎨 Layouts XML
              </button>
              <button
                onClick={() => setActiveCategory('android_config')}
                className={`px-2 py-0.5 rounded-md font-semibold transition-all cursor-pointer ${
                  activeCategory === 'android_config' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                ⚙️ Gradle &amp; Manifest
              </button>
            </div>
          </div>
        </div>

        {/* Modal Body: Sidebar with Files + Code Viewer */}
        <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
          
          {/* Files Sidebar */}
          <div className="w-full md:w-80 bg-slate-950/90 border-b md:border-b-0 md:border-r border-slate-800/80 p-2.5 overflow-y-auto shrink-0 flex md:flex-col gap-1 max-h-40 md:max-h-full">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-2 py-1 hidden md:block">
              Arquivos do Projeto ({filteredFiles.length})
            </span>
            {filteredFiles.map((file) => {
              const isSelected = selectedFile.name === file.name;
              let badgeColor = 'text-blue-400';
              if (file.category === 'android_java') badgeColor = 'text-amber-400';
              else if (file.category === 'android_res') badgeColor = 'text-purple-400';
              else if (file.category === 'android_config') badgeColor = 'text-emerald-400';

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
                  <FileCode className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-white' : badgeColor}`} />
                  <div className="truncate flex-1">
                    <p className="truncate leading-tight">{file.name}</p>
                    <p className={`text-[10px] truncate ${isSelected ? 'text-blue-100' : 'text-slate-500'}`}>
                      {file.path}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Code Viewer */}
          <div className="flex-1 flex flex-col min-h-0 bg-slate-900">
            {/* File info bar */}
            <div className="px-4 py-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between gap-3 text-xs shrink-0">
              <div className="truncate">
                <span className="font-mono text-emerald-400 font-semibold">{selectedFile.path}</span>
                <p className="text-[11px] text-slate-400 truncate mt-0.5">{selectedFile.description}</p>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={handleCopyCode}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-all cursor-pointer font-medium active:scale-95 text-xs"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copiado!' : 'Copiar'}</span>
                </button>

                <button
                  onClick={() => handleDownloadSingleFile(selectedFile)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-all cursor-pointer font-medium active:scale-95 text-xs"
                  title="Baixar apenas este arquivo"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="hidden sm:inline">Baixar Arquivo</span>
                </button>
              </div>
            </div>

            {/* Code Content Box */}
            <div className="flex-1 overflow-auto p-4 font-mono text-xs text-slate-200 bg-slate-950/95 leading-relaxed selection:bg-blue-600 selection:text-white">
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
            <span>
              Gradle 8.7 • AGP 8.5.2 • SDK 34 • Material Components • SQLite + {ANDROID_BINARY_ASSETS.length} ícones PNG inclusos no .ZIP
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleDownloadZip}
              className="text-emerald-400 hover:text-emerald-300 font-semibold underline cursor-pointer"
            >
              Baixar .ZIP para Android Studio
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
