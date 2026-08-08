"use client";

import { FormEvent, useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

type Props = {
  recovery: boolean;
  recoveryCode?: string | null;
  recoveryError?: string | null;
};

export function UpdatePasswordForm({
  recovery,
  recoveryCode = null,
  recoveryError = null,
}: Props) {
  const router = useRouter();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [recoveryReady, setRecoveryReady] = useState(!recovery);
  const [error, setError] = useState(
    recoveryError ? "Посилання недійсне або застаріло." : "",
  );
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!recovery) {
      return;
    }

    if (recoveryError) {
      return;
    }

    if (!recoveryCode) {
      setError("Посилання недійсне або застаріло.");
      return;
    }

    let cancelled = false;

    async function prepareRecoverySession() {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          isSingleton: false,
          auth: {
            detectSessionInUrl: false,
          },
        },
      );

      const { error: exchangeError } =
        await supabase.auth.exchangeCodeForSession(recoveryCode!);

      if (cancelled) {
        return;
      }

      if (exchangeError) {
        setError(formatRecoveryError(exchangeError.message));
        return;
      }

      // Прибираємо одноразовий auth code з адресного рядка.
      window.history.replaceState(
        {},
        "",
        "/update-password?recovery=1",
      );

      setRecoveryReady(true);
    }

    void prepareRecoverySession();

    return () => {
      cancelled = true;
    };
  }, [recovery, recoveryCode, recoveryError]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setSuccess(false);

    if (recovery && !recoveryReady) {
      setError("Спочатку відкрийте актуальне посилання з листа.");
      return;
    }

    if (!recovery && !currentPassword) {
      setError("Введіть поточний пароль.");
      return;
    }

    if (newPassword.length < 6) {
      setError("Новий пароль має містити щонайменше 6 символів.");
      return;
    }

    if (newPassword !== repeatPassword) {
      setError("Нові паролі не збігаються.");
      return;
    }

    setPending(true);

    try {
      const supabase = createClient();

      const attributes = recovery
        ? {
            password: newPassword,
          }
        : {
            password: newPassword,
            current_password: currentPassword,
          };

      const { error: updateError } = await supabase.auth.updateUser(attributes);

      if (updateError) {
        setError(formatAuthError(updateError.message));
        return;
      }

      if (recovery) {
        await supabase.auth.signOut();

        window.location.href = `/login?message=${encodeURIComponent(
          "Пароль змінено. Увійдіть з новим паролем.",
        )}`;

        return;
      }

      setCurrentPassword("");
      setNewPassword("");
      setRepeatPassword("");
      setSuccess(true);
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  if (recovery && !recoveryReady && !error) {
    return (
      <div className="mt-6 rounded-xl border bg-gray-50 p-4 text-sm text-gray-600">
        Перевіряємо посилання…
      </div>
    );
  }

  if (recovery && !recoveryReady && error) {
    return (
      <div className="mt-6 space-y-4">
        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>

        <a
          href="/forgot-password"
          className="inline-block rounded-lg bg-black px-5 py-3 text-sm font-medium text-white transition hover:bg-gray-800"
        >
          Надіслати нове посилання
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
      {error && (
        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {success && (
        <p className="rounded-lg bg-green-50 p-3 text-sm text-green-700">
          Пароль успішно змінено.
        </p>
      )}

      {!recovery && (
        <PasswordField
          id="current-password"
          label="Поточний пароль"
          value={currentPassword}
          onChange={setCurrentPassword}
          autoComplete="current-password"
        />
      )}

      <PasswordField
        id="new-password"
        label="Новий пароль"
        value={newPassword}
        onChange={setNewPassword}
        autoComplete="new-password"
      />

      <PasswordField
        id="repeat-password"
        label="Повторіть новий пароль"
        value={repeatPassword}
        onChange={setRepeatPassword}
        autoComplete="new-password"
      />

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-black px-5 py-3 font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending
          ? "Зберігаємо..."
          : recovery
            ? "Встановити новий пароль"
            : "Змінити пароль"}
      </button>
    </form>
  );
}

type PasswordFieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete: "current-password" | "new-password";
};

function PasswordField({
  id,
  label,
  value,
  onChange,
  autoComplete,
}: PasswordFieldProps) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-medium">
        {label}
      </label>

      <input
        id={id}
        type="password"
        required
        minLength={6}
        autoComplete={autoComplete}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-lg border p-3 outline-none focus:border-black"
      />
    </div>
  );
}

function formatRecoveryError(message: string) {
  const normalized = message.toLowerCase();

  if (
    normalized.includes("expired") ||
    normalized.includes("invalid") ||
    normalized.includes("code verifier") ||
    normalized.includes("auth code")
  ) {
    return "Посилання недійсне або застаріло. Надішліть нове.";
  }

  return "Не вдалося відкрити посилання для відновлення. Надішліть нове.";
}

function formatAuthError(message: string) {
  const normalized = message.toLowerCase();

  if (
    normalized.includes("current password") ||
    normalized.includes("invalid password")
  ) {
    return "Поточний пароль введено неправильно.";
  }

  if (
    normalized.includes("same password") ||
    normalized.includes("different from the old password")
  ) {
    return "Новий пароль має відрізнятися від поточного.";
  }

  if (normalized.includes("password") && normalized.includes("characters")) {
    return "Пароль не відповідає вимогам безпеки.";
  }

  if (normalized.includes("nonce") || normalized.includes("reauth")) {
    return "Для зміни пароля потрібно повторно підтвердити вхід.";
  }

  return "Не вдалося змінити пароль. Спробуйте ще раз.";
}
