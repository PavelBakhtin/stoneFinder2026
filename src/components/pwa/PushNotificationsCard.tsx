"use client";

import { useEffect, useState } from "react";

import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

type BusyAction = "enable" | "disable" | "test" | null;

type NavigatorWithStandalone = Navigator & {
  standalone?: boolean;
};

function isIosDevice() {
  const ua = window.navigator.userAgent;
  const isAppleMobile = /iPad|iPhone|iPod/.test(ua);
  const isTouchMac =
    navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;

  return isAppleMobile || isTouchMac;
}

function isStandaloneMode() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    Boolean((navigator as NavigatorWithStandalone).standalone)
  );
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let index = 0; index < rawData.length; index += 1) {
    outputArray[index] = rawData.charCodeAt(index);
  }

  return outputArray;
}

async function saveSubscription(subscription: PushSubscription) {
  const response = await fetch("/api/push/subscribe", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(subscription.toJSON()),
  });

  const result = (await response.json()) as { error?: string };

  if (!response.ok) {
    throw new Error(result.error || "Не вдалося зберегти push-підписку");
  }
}

export function PushNotificationsCard() {
  const [isSupported, setIsSupported] = useState(true);
  const [requiresIosInstall, setRequiresIosInstall] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [permission, setPermission] =
    useState<NotificationPermission>("default");
  const [statusChecked, setStatusChecked] = useState(false);
  const [busyAction, setBusyAction] = useState<BusyAction>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

  useEffect(() => {
    let cancelled = false;

    async function checkStatus() {
      const supported =
        "serviceWorker" in navigator &&
        "PushManager" in window &&
        "Notification" in window &&
        Boolean(vapidPublicKey);

      if (!supported) {
        if (!cancelled) {
          setIsSupported(false);
          setStatusChecked(true);
        }
        return;
      }

      const needsInstall = isIosDevice() && !isStandaloneMode();

      if (!cancelled) {
        setRequiresIosInstall(needsInstall);
        setPermission(Notification.permission);
      }

      if (needsInstall) {
        if (!cancelled) setStatusChecked(true);
        return;
      }

      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();

        if (!cancelled) {
          setIsSubscribed(Boolean(subscription));
          setStatusChecked(true);
        }

        // If the same installed app/browser was previously used by another
        // account, this securely reassigns the endpoint to the current user.
        if (subscription && Notification.permission === "granted") {
          await saveSubscription(subscription);
        }
      } catch (caughtError) {
        console.error("Не вдалося перевірити push-підписку", caughtError);

        if (!cancelled) {
          setStatusChecked(true);
        }
      }
    }

    void checkStatus();

    return () => {
      cancelled = true;
    };
  }, [vapidPublicKey]);

  async function enableNotifications() {
    if (!vapidPublicKey || busyAction) return;

    setBusyAction("enable");
    setMessage("");
    setError("");

    let createdSubscription: PushSubscription | null = null;

    try {
      const newPermission =
        Notification.permission === "granted"
          ? "granted"
          : await Notification.requestPermission();

      setPermission(newPermission);

      if (newPermission !== "granted") {
        setError(
          newPermission === "denied"
            ? "Сповіщення заблоковані в налаштуваннях браузера/телефону."
            : "Без дозволу браузера push-сповіщення не працюватимуть.",
        );
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      let subscription = await registration.pushManager.getSubscription();

      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
        });
        createdSubscription = subscription;
      }

      await saveSubscription(subscription);
      setIsSubscribed(true);
      setMessage("Сповіщення увімкнено.");
    } catch (caughtError) {
      if (createdSubscription) {
        await createdSubscription.unsubscribe().catch(() => undefined);
      }

      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Не вдалося увімкнути сповіщення",
      );
    } finally {
      setBusyAction(null);
    }
  }

  async function disableNotifications() {
    if (busyAction) return;

    setBusyAction("disable");
    setMessage("");
    setError("");

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        const response = await fetch("/api/push/subscribe", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ endpoint: subscription.endpoint }),
        });

        if (!response.ok) {
          const result = (await response.json()) as { error?: string };
          throw new Error(result.error || "Не вдалося вимкнути сповіщення");
        }

        await subscription.unsubscribe();
      }

      setIsSubscribed(false);
      setMessage("Сповіщення вимкнено на цьому пристрої.");
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Не вдалося вимкнути сповіщення",
      );
    } finally {
      setBusyAction(null);
    }
  }

  async function sendTestNotification() {
    if (busyAction) return;

    setBusyAction("test");
    setMessage("");
    setError("");

    try {
      const response = await fetch("/api/push/test", { method: "POST" });
      const result = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(result.error || "Не вдалося відправити тестовий push");
      }

      setMessage("Тестове сповіщення відправлено.");
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Не вдалося відправити тестове сповіщення",
      );
    } finally {
      setBusyAction(null);
    }
  }

  return (
    <section className="mt-10 border-t border-gray-200 pt-6">
      <h2 className="text-lg font-semibold">Сповіщення</h2>
      <p className="mt-1 text-sm leading-5 text-gray-500">
        StoneFinder зможе повідомити про новий відповідний матеріал, навіть
        коли застосунок закритий.
      </p>

      {!statusChecked ? (
        <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
          <LoadingSpinner className="h-4 w-4" />
          Перевіряємо налаштування сповіщень…
        </div>
      ) : !isSupported ? (
        <p className="mt-4 rounded-xl bg-stone-100 p-4 text-sm text-gray-700">
          Push-сповіщення недоступні в цьому браузері або ще не налаштовані на
          сервері.
        </p>
      ) : requiresIosInstall ? (
        <p className="mt-4 rounded-xl bg-stone-100 p-4 text-sm leading-5 text-gray-700">
          На iPhone спочатку встановіть StoneFinder через Safari: натисніть
          <strong> Поділитися → На початковий екран</strong>, відкрийте
          встановлений StoneFinder і поверніться сюди.
        </p>
      ) : permission === "denied" ? (
        <div className="mt-4 space-y-3">
          <button
            type="button"
            disabled
            className="flex w-full cursor-not-allowed items-center justify-center rounded-lg bg-gray-200 px-5 py-3 text-sm font-medium text-gray-600 sm:w-auto"
          >
            🔕 Сповіщення заблоковані
          </button>

          <p className="text-sm leading-5 text-gray-600">
            Дозвольте сповіщення для StoneFinder у налаштуваннях браузера або
            телефону, а потім оновіть сторінку.
          </p>
        </div>
      ) : (
        <div className="mt-4 grid gap-3 sm:flex sm:flex-wrap">
          {!isSubscribed ? (
            <button
              type="button"
              onClick={enableNotifications}
              disabled={busyAction !== null}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-black px-5 py-3 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-wait disabled:opacity-60 sm:w-auto"
            >
              {busyAction === "enable" && (
                <LoadingSpinner className="h-4 w-4" />
              )}
              {busyAction === "enable"
                ? "Вмикаємо…"
                : "Увімкнути сповіщення"}
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={sendTestNotification}
                disabled={busyAction !== null}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-black px-5 py-3 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-wait disabled:opacity-60 sm:w-auto"
              >
                {busyAction === "test" && (
                  <LoadingSpinner className="h-4 w-4" />
                )}
                {busyAction === "test" ? "Надсилаємо…" : "Надіслати тест"}
              </button>

              <button
                type="button"
                onClick={disableNotifications}
                disabled={busyAction !== null}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 px-5 py-3 text-sm font-medium transition hover:bg-gray-50 disabled:cursor-wait disabled:opacity-60 sm:w-auto"
              >
                {busyAction === "disable" && (
                  <LoadingSpinner className="h-4 w-4" />
                )}
                {busyAction === "disable" ? "Вимикаємо…" : "Вимкнути"}
              </button>
            </>
          )}
        </div>
      )}

      {message && <p className="mt-3 text-sm text-green-700">{message}</p>}
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
    </section>
  );
}
