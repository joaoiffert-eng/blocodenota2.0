import React, { useEffect, useState, useRef } from 'react';
import QRCode from 'qrcode';
import { 
  X, 
  Smartphone, 
  Download, 
  Share, 
  PlusSquare, 
  MoreVertical, 
  Check, 
  Copy, 
  Sparkles, 
  QrCode, 
  CheckCircle2, 
  Code2, 
  ExternalLink,
  Layers,
  ArrowRight
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface InstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenJavaModal?: () => void;
  onShowToast?: (message: string, type: 'success' | 'error' | 'info') => void;
}

export const InstallModal: React.FC<InstallModalProps> = ({
  isOpen,
  onClose,
  onOpenJavaModal,
  onShowToast,
}) => {
  const { isInstallable, isInstalled, isIOS, isAndroid, install } = usePWAInstall();
  const [activeTab, setActiveTab] = useState<'pwa' | 'qrcode' | 'android-java'>(
    isIOS ? 'pwa' : isAndroid ? 'pwa' : 'pwa'
  );
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  // Generate QR code for mobile scanning
  useEffect(() => {
    if (isOpen && currentUrl) {
      QRCode.toDataURL(currentUrl, {
        width: 240,
        margin: 2,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
      })
        .then((url) => setQrCodeUrl(url))
        .catch((err) => console.error('Error generating QR code:', err));
    }
  }, [isOpen, currentUrl]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    setIsInstalling(true);
    try {
      const result = await install();
      if (result === 'accepted') {
        onShowToast?.('Aplicativo instalado com sucesso!', 'success');
        onClose();
      } else if (result === 'dismissed') {
        onShowToast?.('Instalação cancelada pelo usuário', 'info');
      } else {
        // Native prompt not ready/available in this browser view
        setActiveTab('pwa');
      }
    } finally {
      setIsInstalling(false);
    }
  };

  const handleCopyLink = () => {
    if (navigator.clipboard && currentUrl) {
      navigator.clipboard.writeText(currentUrl);
      setCopiedLink(true);
      onShowToast?.('Link copiado para a área de transferência!', 'success');
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="install-modal-title"
    >
      <div 
        ref={modalRef}
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/90 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
      >
        {/* Modal Header */}
        <div className="relative px-5 pt-5 pb-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner">
                <Smartphone className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 id="install-modal-title" className="text-lg font-bold leading-tight">
                  Instalar no Celular
                </h2>
                <p className="text-xs text-blue-100 font-medium">
                  Acesso rápido, ícone na tela inicial e funciona 100% offline
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer"
              aria-label="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick status pill */}
          {isInstalled && (
            <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/30 text-emerald-100 text-xs font-semibold backdrop-blur-sm border border-emerald-400/30">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
              Aplicativo já está instalado neste dispositivo!
            </div>
          )}
        </div>

        {/* Tab selection */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 p-1.5 gap-1 shrink-0">
          <button
            onClick={() => setActiveTab('pwa')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'pwa'
                ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Passo a Passo</span>
          </button>

          <button
            onClick={() => setActiveTab('qrcode')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'qrcode'
                ? 'bg-white dark:bg-slate-800 text-purple-600 dark:text-purple-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Abrir pelo QR Code</span>
          </button>

          <button
            onClick={() => setActiveTab('android-java')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'android-java'
                ? 'bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>App Java (APK)</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1 text-slate-800 dark:text-slate-200">
          
          {/* TAB 1: PWA Instructions & 1-Click Install */}
          {activeTab === 'pwa' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* Direct 1-Click Install Button if browser supports it */}
              {isInstallable && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 border border-blue-200 dark:border-blue-800/60 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
                  <div>
                    <h3 className="text-sm font-bold text-blue-950 dark:text-blue-100 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      Instalação Imediata Suportada
                    </h3>
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                      Seu navegador suporta a instalação com 1 clique direto na tela.
                    </p>
                  </div>
                  <button
                    onClick={handleInstallClick}
                    disabled={isInstalling}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
                  >
                    <Download className="w-4 h-4" />
                    <span>{isInstalling ? 'Instalando...' : 'Instalar Agora'}</span>
                  </button>
                </div>
              )}

              {/* Instructions for Android Chrome */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <span className="text-xs font-bold">🤖</span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    No Android (Google Chrome ou Samsung Internet)
                  </h3>
                </div>

                <ol className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                      1
                    </span>
                    <span>
                      Abra o link do aplicativo no navegador <strong>Google Chrome</strong> do celular.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                      2
                    </span>
                    <span className="inline-flex items-center flex-wrap gap-1">
                      Toque no menu de <strong>três pontinhos</strong> 
                      <span className="inline-flex items-center px-1.5 py-0.5 bg-slate-200 dark:bg-slate-700 rounded text-[11px] font-bold">
                        <MoreVertical className="w-3 h-3 inline mr-0.5" /> ⋮
                      </span>
                      no canto superior direito.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                      3
                    </span>
                    <span>
                      Toque na opção <strong>"Instalar aplicativo"</strong> ou <strong>"Adicionar à tela inicial"</strong>.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                      4
                    </span>
                    <span>
                      Pronto! O ícone do <strong>Bloco de Notas</strong> aparecerá na sua gaveta de aplicativos e abrirá sem barras de navegador.
                    </span>
                  </li>
                </ol>
              </div>

              {/* Instructions for iOS Safari */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                    <span className="text-xs font-bold">🍎</span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    No iPhone ou iPad (Navegador Safari)
                  </h3>
                </div>

                <ol className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                      1
                    </span>
                    <span>
                      Abra o site no navegador <strong>Safari</strong> do seu iPhone.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                      2
                    </span>
                    <span className="inline-flex items-center flex-wrap gap-1">
                      Toque no botão de <strong>Compartilhar</strong>
                      <span className="inline-flex items-center px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/60 rounded text-[11px] font-bold text-blue-700 dark:text-blue-300">
                        <Share className="w-3 h-3 inline mr-1" /> Compartilhar
                      </span>
                      na barra inferior do Safari.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                      3
                    </span>
                    <span className="inline-flex items-center flex-wrap gap-1">
                      Role a lista para baixo e toque em 
                      <span className="inline-flex items-center px-1.5 py-0.5 bg-slate-200 dark:bg-slate-700 rounded text-[11px] font-bold">
                        <PlusSquare className="w-3 h-3 inline mr-1" /> Adicionar à Tela de Início
                      </span>.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                      4
                    </span>
                    <span>
                      Toque em <strong>"Adicionar"</strong> no canto superior direito para finalizar.
                    </span>
                  </li>
                </ol>
              </div>
            </div>
          )}

          {/* TAB 2: QR Code Scanning */}
          {activeTab === 'qrcode' && (
            <div className="space-y-4 text-center animate-in fade-in duration-150">
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Se você está no computador, aponte a câmera do seu celular para o QR Code abaixo para abrir o aplicativo no smartphone e instalá-lo:
              </p>

              <div className="inline-block p-4 bg-white rounded-3xl shadow-md border border-slate-200 mx-auto">
                {qrCodeUrl ? (
                  <img 
                    src={qrCodeUrl} 
                    alt="QR Code para abrir no celular" 
                    className="w-48 h-48 sm:w-56 sm:h-56 mx-auto rounded-xl"
                  />
                ) : (
                  <div className="w-48 h-48 flex items-center justify-center text-slate-400">
                    <QrCode className="w-12 h-12 animate-pulse" />
                  </div>
                )}
              </div>

              <div className="flex items-center justify-center gap-2 max-w-sm mx-auto">
                <input
                  type="text"
                  readOnly
                  value={currentUrl}
                  className="flex-1 px-3 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 select-all"
                />
                <button
                  onClick={handleCopyLink}
                  className="px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all shadow-sm active:scale-95 flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'Copiado!' : 'Copiar'}</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: Android Java Project */}
          {activeTab === 'android-java' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60">
                <div className="flex items-center gap-2 mb-2 text-amber-800 dark:text-amber-300 font-bold text-sm">
                  <Code2 className="w-4 h-4 text-amber-600" />
                  Código Java Android Nativo Disponível
                </div>
                <p className="text-xs text-amber-900/80 dark:text-amber-200/80 leading-relaxed mb-3">
                  Você solicitou o aplicativo em Java. Desenvolvemos o código fonte nativo completo em Java (com SQLite, RecyclerView, Model Note, Adapter e Layouts XML) pronto para compilar no <strong>Android Studio</strong> e gerar o arquivo <strong>.APK</strong> para instalar diretamente no celular.
                </p>

                <div className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span><code>MainActivity.java</code>, <code>NoteEditorActivity.java</code></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span><code>NoteDatabaseHelper.java</code> (Banco SQLite offline)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Download completo em arquivo <strong>.ZIP</strong> com 1 clique</span>
                  </div>
                </div>

                {onOpenJavaModal && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenJavaModal();
                    }}
                    className="mt-4 w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                  >
                    <Layers className="w-4 h-4" />
                    <span>Abrir e Baixar Projeto Java Completo (.ZIP)</span>
                  </button>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between shrink-0">
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            🔒 Dados salvos no seu próprio celular com privacidade total.
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            Entendi / Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
