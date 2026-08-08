"use client";

import { FormEvent, useState } from "react";

import { createClient } from "@/lib/supabase/client";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setPending(true);
    setError("");

    try {
      const supabase = createClient();

      const resetUrl = new URL("/update-password", window.location.origin);
      resetUrl.searchParams.set("recovery", "1");

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email.trim(),
        {
          redirectTo: resetUrl.toString(),
        },
      );

      if (resetError) {
        setError(formatAuthError(resetError.message));
        return;
      }

      setSent(true);
    } finally {
      setPending(false);
    }
  }

  if (sent) {
    return (
      <div className="mt-6 rounded-xl border border-green-200 bg-green-50 p-4">
        <p className="font-semibold text-green-800">Перевірте пошту</p>

        <p className="mt-1 text-sm leading-6 text-green-800">
          Якщо обліковий запис із таким email існує, на нього надіслано
          посилання для зміни пароля.
        </p>

        <button
          type="button"
          onClick={() => {
            setSent(false);
            setError("");
          }}
          className="mt-4 text-sm font-medium text-green-900 underline underline-offset-2"
        >
          Надіслати ще раз
        </button>
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

      <div>
        <label htmlFor="recovery-email" className="mb-2 block text-sm font-medium">
          Email
        </label>

        <input
          id="recovery-email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="name@example.com"
          className="w-full rounded-lg border p-3 outline-none focus:border-black"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-black px-5 py-3 font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Надсилаємо..." : "Надіслати посилання"}
      </button>
    </form>
  );
}

function formatAuthError(message: string) {
  const normalized = message.toLowerCase();

  if (normalized.includes("rate limit")) {
    return "Забагато спроб. Зачекайте трохи та спробуйте ще раз.";
  }

  return "Не вдалося надіслати лист. Спробуйте ще раз.";
}
