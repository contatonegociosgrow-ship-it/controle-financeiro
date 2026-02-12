'use client';

import { useState, useEffect } from 'react';

export function usePWAInstall() {
  const [isInstalled, setIsInstalled] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkInstallation = () => {
      // Verificar se está rodando como PWA instalado
      const isStandaloneMode = 
        (window.matchMedia('(display-mode: standalone)').matches) ||
        ((window.navigator as any).standalone === true) ||
        document.referrer.includes('android-app://') ||
        window.location.search.includes('utm_source=homescreen');

      setIsInstalled(isStandaloneMode);

      // Detectar iOS
      const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
      setIsIOS(iOS);

      // Detectar Android
      const android = /Android/.test(navigator.userAgent);
      setIsAndroid(android);

      setIsMobile(iOS || android);
      setIsChecking(false);
    };

    // Verificar imediatamente
    checkInstallation();

    // Verificar periodicamente (caso o usuário instale enquanto está na página)
    const interval = setInterval(checkInstallation, 1000);

    // Listener para quando o app é instalado
    const handleAppInstalled = () => {
      setIsInstalled(true);
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      clearInterval(interval);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  return {
    isInstalled,
    isMobile,
    isIOS,
    isAndroid,
    isChecking,
    shouldBlock: !isInstalled && isMobile && !isChecking,
  };
}
