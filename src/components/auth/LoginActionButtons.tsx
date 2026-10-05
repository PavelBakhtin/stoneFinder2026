"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";

import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

type ServerAction = (formData: FormData) => void | Promise<void>;

type Props = {
  loginAction: ServerAction;
  signUpAction: ServerAction;
};

export function LoginActionButtons({
  loginAction,
  signUpAction,
}: Props) {
  const { pending } = useFormStatus();
  const [activeAction, setActiveAction] = useState<"login" | "signup" | null>(
    null,
  );

  const loginPending = pending && activeAction !== "signup";
  const signUpPending = pending && activeAction === "signup";

  return (
    <div className="grid grid-cols-2 gap-3">
      <button
        type="submit"
        formAction={loginAction}
        onClick={() => setActiveAction("login")}
        disabled={pending}
        className="flex items-center justify-center gap-2 rounded-lg bg-black py-3 font-medium text-white transition hover:bg-gray-800 disabled:cursor-wait disabled:opacity-60"
      >
        {loginPending && <LoadingSpinner className="h-4 w-4" />}
        <span>{loginPending ? "Входимо…" : "Увійти"}</span>
      </button>

      <button
        type="submit"
        formAction={signUpAction}
        onClick={() => setActiveAction("signup")}
        disabled={pending}
        className="flex items-center justify-center gap-2 rounded-lg border py-3 font-medium transition hover:bg-gray-50 disabled:cursor-wait disabled:opacity-60"
      >
        {signUpPending && <LoadingSpinner className="h-4 w-4" />}
        <span>{signUpPending ? "Реєструємо…" : "Реєстрація"}</span>
      </button>
    </div>
  );
}
