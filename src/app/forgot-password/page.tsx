import Link from "next/link";

import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <main className="mx-auto max-w-md p-6">
      <Link
        href="/login"
        className="mb-6 inline-block text-sm text-gray-600 transition hover:text-black"
      >
        ← До входу
      </Link>

      <h1 className="text-3xl font-bold">Відновлення пароля</h1>

      <p className="mt-2 text-sm leading-6 text-gray-500">
        Вкажіть email, з яким реєструвалися. Ми надішлемо посилання для
        встановлення нового пароля.
      </p>

      <ForgotPasswordForm />
    </main>
  );
}
