"use client";

import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import Tooltip from "../TiptapEditor/components/ui/Tooltip";

export function InstallPWA() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSPrompt, setShowIOSPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Detect iOS
    const ua = window.navigator.userAgent;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const isIOSDevice =
      /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream;
    setIsIOS(isIOSDevice);

    // Detect if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setDeferredPrompt(null);
      }
    } else if (isIOS) {
      setShowIOSPrompt(true);
    }
  };

  if (isInstalled || (!deferredPrompt && !isIOS)) {
    return null;
  }

  return (
    <>
      <Tooltip content="Instalar App" portal>
        <button
          onClick={handleInstallClick}
          className="flex items-center gap-1.5 text-sm font-medium text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white transition-colors animate-in fade-in zoom-in"
        >
          <Download className="w-4 h-4" />
          <span className="hidden lg:inline">Instalar</span>
        </button>
      </Tooltip>

      {showIOSPrompt && (
        <div className="fixed inset-x-0 bottom-6 z-50 px-4 animate-in slide-in-from-bottom">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 shadow-xl rounded-xl p-4 max-w-sm mx-auto relative flex flex-col gap-2">
            <button
              onClick={() => setShowIOSPrompt(false)}
              className="absolute right-3 top-3 text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
            >
              &times;
            </button>
            <h4 className="text-sm font-semibold text-neutral-900 dark:text-white">
              Instalar o App no iOS
            </h4>
            <p className="text-xs text-neutral-600 dark:text-neutral-400">
              Toque no botão de <b>Compartilhar</b> <span className="inline-block border rounded px-1 align-middle text-[10px]">↑</span> na
              barra inferior do navegador e desça até <b>&quot;Adicionar à Tela de Início&quot;</b>.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
