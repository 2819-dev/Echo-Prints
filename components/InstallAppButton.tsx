"use client";

import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

function isIOS() {
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}

export default function InstallAppButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [showIOSHelp, setShowIOSHelp] = useState(false);
  const [platform, setPlatform] = useState<"android" | "ios" | "other" | null>(null);

  useEffect(() => {
    if (isStandalone()) {
      setInstalled(true);
      return;
    }
    setPlatform(isIOS() ? "ios" : "other");

    function handlePrompt(e: Event) {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setPlatform("android");
    }
    function handleInstalled() {
      setInstalled(true);
      setDeferredPrompt(null);
    }

    window.addEventListener("beforeinstallprompt", handlePrompt);
    window.addEventListener("appinstalled", handleInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", handlePrompt);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  if (installed || platform === null) return null;

  async function handleClick() {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") setInstalled(true);
      setDeferredPrompt(null);
      return;
    }
    if (platform === "ios") {
      setShowIOSHelp((v) => !v);
    }
  }

  // On platforms that don't support an install prompt (desktop Safari/Firefox
  // without one yet), only show the button once we have something to do.
  if (platform === "other" && !deferredPrompt) return null;

  return (
    <div className="relative">
      <button
        onClick={handleClick}
        className="rounded-lg border border-hairline px-3.5 py-1.5 text-sm font-semibold text-ink transition hover:bg-panel2"
      >
        Add to Home Screen
      </button>
      {showIOSHelp && (
        <div className="absolute left-0 top-full z-30 mt-2 w-60 max-w-[80vw] rounded-xl border border-hairline bg-white p-3 text-xs text-muted shadow-xl">
          <p className="font-semibold text-ink">On iPhone/iPad:</p>
          <p className="mt-1">
            Tap the Share icon in Safari, then <span className="font-medium text-ink">Add to Home Screen</span>.
          </p>
          <button onClick={() => setShowIOSHelp(false)} className="mt-2 text-accent hover:text-accent-dark">
            Got it
          </button>
        </div>
      )}
    </div>
  );
}
