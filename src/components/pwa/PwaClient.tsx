"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
}

type NavigatorWithStandalone = Navigator & {
  standalone?: boolean;
};

const DISMISS_STORAGE_KEY = "stonefinder-pwa-install-dismissed-at";
const DISMISS_FOR_MS = 24 * 60 * 60 * 1000;

function wasRecentlyDismissed() {
  try {
    const value = window.localStorage.getItem(DISMISS_STORAGE_KEY);
    if (!value) return false;

    const dismissedAt = Number(value);
    return Number.isFinite(dismissedAt) && Date.now() - dismissedAt < DISMISS_FOR_MS;
  } catch {
    return false;
  }
}

function isStandaloneMode() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    Boolean((navigator as NavigatorWithStandalone).standalone)
  );
}

function isIosDevice() {
  const ua = window.navigator.userAgent;
  const isAppleMobile = /iPad|iPhone|iPod/.test(ua);
  const isTouchMac =
    navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;

  return isAppleMobile || isTouchMac;
}

function isLikelyMobileDevice() {
  return (
    navigator.maxTouchPoints > 0 &&
    window.matchMedia("(max-width: 1024px)").matches
  );
}

export function PwaClient() {
  const pathname = usePathname();
  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showIosHelp, setShowIosHelp] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [canShowPrompt, setCanShowPrompt] = useState(false);

  const isAuthPage =
    pathname === "/login" ||
    pathname === "/forgot-password" ||
    pathname === "/update-password";

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch((error) => {
        console.error("Не вдалося зареєструвати service worker", error);
      });
    }

    const standalone = isStandaloneMode();
    const ios = isIosDevice();
    const mobile = isLikelyMobileDevice();

    setIsIos(ios);
    setCanShowPrompt(mobile && !standalone && !wasRecentlyDismissed());

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setInstallPrompt(null);
      setCanShowPrompt(false);
      setShowIosHelp(false);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  if (
    !canShowPrompt ||
    isAuthPage ||
    (!installPrompt && !isIos)
  ) {
    return null;
  }

  async function installApp() {
    if (installPrompt) {
      await installPrompt.prompt();
      const choice = await installPrompt.userChoice;

      if (choice.outcome === "accepted") {
        setCanShowPrompt(false);
      }

      setInstallPrompt(null);
      return;
    }

    if (isIos) {
      setShowIosHelp(true);
    }
  }

  function dismiss() {
    try {
      window.localStorage.setItem(DISMISS_STORAGE_KEY, String(Date.now()));
    } catch {
      // Ignore storage errors; the prompt can simply return next time.
    }

    setCanShowPrompt(false);
  }

  return (
    <div className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-md pb-[env(safe-area-inset-bottom)] sm:inset-x-auto sm:right-4 sm:bottom-4 sm:w-[380px]">
      <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-2xl">
        <div className="flex items-start gap-3">
          <Image
            src="/icons/icon-192.png"
            alt=""
            width={48}
            height={48}
            className="h-12 w-12 shrink-0 rounded-xl"
          />

          <div className="min-w-0 flex-1">
            <p className="font-semibold text-stone-950">
              Встановити StoneFinder
            </p>
            <p className="mt-1 text-sm leading-5 text-stone-600">
              Додайте StoneFinder на головний екран і відкривайте його як
              звичайний застосунок.
            </p>
          </div>

          <button
            type="button"
            onClick={dismiss}
            aria-label="Закрити"
            className="-mr-1 -mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xl leading-none text-stone-400 transition hover:bg-stone-100 hover:text-stone-700"
          >
            ×
          </button>
        </div>

        {showIosHelp ? (
          <div className="mt-4 rounded-xl bg-stone-100 p-3 text-sm leading-5 text-stone-700">
            На iPhone натисніть <strong>Поділитися</strong> у браузері, потім
            оберіть <strong>«На початковий екран»</strong>.
          </div>
        ) : (
          <button
            type="button"
            onClick={installApp}
            className="mt-4 w-full rounded-xl bg-black px-4 py-3 text-sm font-semibold text-white transition hover:bg-stone-800"
          >
            Встановити застосунок
          </button>
        )}
      </div>
    </div>
  );
}
