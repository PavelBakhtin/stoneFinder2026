"use client";

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
  const { pending, data } = useFormStatus();
  const intent = pending ? data?.get("intent") : null;
  const loginPending = pending && intent === "login";
  const signUpPending = pending && intent === "signup";

  return (
    <div className="grid grid-cols-2 gap-3">
      <button
        type="submit"
        name="intent"
        value="login"
        formAction={loginAction}
        disabled={pending}
        className="flex items-center justify-center gap-2 rounded-lg bg-black py-3 font-medium text-white transition hover:bg-gray-800 disabled:cursor-wait disabled:opacity-60"
      >
        {loginPending && <LoadingSpinner className="h-4 w-4" />}
        <span>{loginPending ? "Входимо…" : "Увійти"}</span>
      </button>

      <button
        type="submit"
        name="intent"
        value="signup"
        formAction={signUpAction}
        disabled={pending}
        className="flex items-center justify-center gap-2 rounded-lg border py-3 font-medium transition hover:bg-gray-50 disabled:cursor-wait disabled:opacity-60"
      >
        {signUpPending && <LoadingSpinner className="h-4 w-4" />}
        <span>{signUpPending ? "Реєструємо…" : "Реєстрація"}</span>
      </button>
    </div>
  );
}
