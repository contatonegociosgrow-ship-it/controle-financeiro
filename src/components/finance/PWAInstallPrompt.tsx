'use client';

import { useState, useEffect } from 'react';
import { X, Download, Share2, Plus } from 'lucide-react';
import { usePWAInstall } from '@/hooks/usePWAInstall';

export function PWAInstallPrompt() {
  const { isInstalled, isMobile, isIOS, isAndroid, shouldBlock } = usePWAInstall();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    // Listener para evento beforeinstallprompt (Android/Chrome)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      // Android/Chrome - usar prompt nativo
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        // O evento appinstalled será disparado automaticamente
      }
      
      setDeferredPrompt(null);
    }
  };

  // Se já estiver instalado ou não for mobile, não mostrar nada
  if (isInstalled || !isMobile) {
    return null;
  }

  // Se não estiver instalado e for mobile, bloquear acesso
  if (shouldBlock) {
    return (
      <div className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 relative">
        <div className="text-center mb-6">
          <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <Download className="w-10 h-10 text-blue-600 dark:text-blue-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Instale o App
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Para continuar, você precisa instalar o aplicativo no seu dispositivo.
          </p>
        </div>

        {isIOS ? (
          <div className="space-y-4 mb-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <span className="text-xl">📱</span>
                Instruções para iPhone/iPad
              </h3>
              <ol className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="font-bold text-blue-600 dark:text-blue-400">1.</span>
                  <span>Toque no botão <strong>Compartilhar</strong> <Share2 className="w-4 h-4 inline" /> na barra inferior do Safari</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-blue-600 dark:text-blue-400">2.</span>
                  <span>Role para baixo e toque em <strong>"Adicionar à Tela de Início"</strong> <Plus className="w-4 h-4 inline" /></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-blue-600 dark:text-blue-400">3.</span>
                  <span>Toque em <strong>"Adicionar"</strong> no canto superior direito</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-blue-600 dark:text-blue-400">4.</span>
                  <span>O app aparecerá na sua tela inicial!</span>
                </li>
              </ol>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-xs text-gray-600 dark:text-gray-400">
              <strong>Dica:</strong> Se você não vê o botão Compartilhar, toque no ícone de compartilhamento na barra de endereço do Safari.
            </div>
          </div>
        ) : isAndroid ? (
          <div className="space-y-4 mb-6">
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <span className="text-xl">🤖</span>
                Instruções para Android
              </h3>
              {deferredPrompt ? (
                <div className="space-y-3">
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                    Toque no botão abaixo para instalar o aplicativo:
                  </p>
                  <button
                    onClick={handleInstallClick}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg"
                  >
                    <Download className="w-5 h-5" />
                    Instalar Agora
                  </button>
                </div>
              ) : (
                <ol className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-green-600 dark:text-green-400">1.</span>
                    <span>Toque no menu <strong>(⋮)</strong> no canto superior direito do Chrome</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-green-600 dark:text-green-400">2.</span>
                    <span>Selecione <strong>"Instalar app"</strong> ou <strong>"Adicionar à tela inicial"</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-green-600 dark:text-green-400">3.</span>
                    <span>Toque em <strong>"Instalar"</strong> na janela de confirmação</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-green-600 dark:text-green-400">4.</span>
                    <span>O app será instalado e aparecerá na sua tela inicial!</span>
                  </li>
                </ol>
              )}
            </div>
          </div>
        ) : null}

        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 text-xs text-yellow-800 dark:text-yellow-200">
          <strong>⚠️ Importante:</strong> Você precisa instalar o app para continuar usando esta página.
        </div>
      </div>
    </div>
    );
  }

  return null;
}
