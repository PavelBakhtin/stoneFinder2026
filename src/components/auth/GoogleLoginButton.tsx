"use client";

import { useState } from "react";

import { createClient } from "@/lib/supabase/client";

export function GoogleLoginButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleGoogleLogin() {
    setIsLoading(true);
    setErrorMessage("");

    const supabase = createClient();

    const redirectTo = `${window.location.origin}/auth/callback`;

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
      },
    });

    if (error) {
      setErrorMessage(error.message);
      setIsLoading(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={isLoading}
        className="flex w-full items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white px-4 py-3 font-medium text-gray-800 transition hover:bg-gray-50 disabled:cursor-wait disabled:opacity-60"
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5">
          <path
            fill="#4285F4"
            d="M21.6 12.23c0-.71-.06-1.4-.18-2.07H12v3.91h5.38a4.6 4.6 0 0 1-2 3.02v2.54h3.24c1.9-1.75 2.98-4.33 2.98-7.4Z"
          />
          <path
            fill="#34A853"
            d="M12 22c2.7 0 4.97-.9 6.63-2.43l-3.24-2.54c-.9.6-2.05.97-3.39.97-2.61 0-4.82-1.76-5.61-4.13H3.04v2.62A10 10 0 0 0 12 22Z"
          />
          <path
            fill="#FBBC05"
            d="M6.39 13.87A6 6 0 0 1 6.08 12c0-.65.11-1.28.31-1.87V7.51H3.04A10 10 0 0 0 2 12c0 1.61.38 3.14 1.04 4.49l3.35-2.62Z"
          />
          <path
            fill="#EA4335"
            d="M12 6c1.47 0 2.79.51 3.83 1.5l2.87-2.87A9.62 9.62 0 0 0 12 2a10 10 0 0 0-8.96 5.51l3.35 2.62C7.18 7.76 9.39 6 12 6Z"
          />
        </svg>

        {isLoading ? "Перенаправлення..." : "Продовжити через Google"}
      </button>

      {errorMessage && (
        <p className="mt-2 text-center text-sm text-red-600">{errorMessage}</p>
      )}
    </div>
  );
}
