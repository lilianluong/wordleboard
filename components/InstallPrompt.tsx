"use client";

import { useEffect, useState } from "react";

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setShowPrompt(false);
    }

    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-md rounded-lg bg-indigo-600 p-4 shadow-lg sm:left-auto">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-white">
            Install Wordle Board for a better experience!
          </p>
        </div>
        <div className="ml-4 flex gap-2">
          <button
            onClick={handleInstall}
            className="rounded-md bg-white px-3 py-1.5 text-sm font-medium text-indigo-600 hover:bg-indigo-50"
          >
            Install
          </button>
          <button
            onClick={handleDismiss}
            className="rounded-md px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}
