"use client";

import { useState } from "react";

import { createClient } from "@/lib/supabase/client";

type Props = {
  next?: string;
};

function safeNextPath(value?: string) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/";
  }

  return value;
}

export function GoogleLoginButton({ next = "/" }: Props) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function handleGoogleLogin() {
    setPending(true);
    setError("");

    try {
      const supabase = createClient();

      const callbackUrl = new URL("/auth/callback", window.location.origin);
      callbackUrl.searchParams.set("next", safeNextPath(next));

      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: callbackUrl.toString(),
        },
      });

      if (oauthError) {
        setError("Не вдалося почати вхід через Google.");
        setPending(false);
      }
    } catch {
      setError("Не вдалося почати вхід через Google.");
      setPending(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={pending}
        className="flex w-full items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white px-4 py-3 font-medium transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <span
          aria-hidden="true"
          className="flex h-5 w-5 items-center justify-center font-bold"
        >
          G
        </span>

        {pending ? "Перенаправлення..." : "Продовжити через Google"}
      </button>

      {error && (
        <p className="mt-2 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
