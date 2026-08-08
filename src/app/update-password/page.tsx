import Link from "next/link";
import { redirect } from "next/navigation";

import { UpdatePasswordForm } from "@/components/auth/UpdatePasswordForm";
import { createClient } from "@/lib/supabase/server";

type Props = {
  searchParams?: Promise<{
    recovery?: string;
    code?: string;
    error?: string;
    error_code?: string;
    error_description?: string;
  }>;
};

export default async function UpdatePasswordPage({ searchParams }: Props) {
  const params = await searchParams;
  const recovery = params?.recovery === "1";

  if (recovery) {
    return (
      <main className="mx-auto max-w-md p-6">
        <Link
          href="/login"
          className="mb-6 inline-block text-sm text-gray-600 transition hover:text-black"
        >
          ← До входу
        </Link>

        <h1 className="text-3xl font-bold">Новий пароль</h1>

        <p className="mt-2 text-sm leading-6 text-gray-500">
          Введіть новий пароль для свого облікового запису.
        </p>

        <UpdatePasswordForm
          recovery
          recoveryCode={params?.code ?? null}
          recoveryError={params?.error_description ?? params?.error ?? null}
        />
      </main>
    );
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(
      `/login?error=${encodeURIComponent(
        "Спочатку увійдіть до облікового запису.",
      )}`,
    );
  }

  const providers = Array.isArray(user.app_metadata?.providers)
    ? user.app_metadata.providers
    : [];

  const hasEmailPassword =
    providers.includes("email") || user.app_metadata?.provider === "email";

  if (!hasEmailPassword) {
    redirect("/profile");
  }

  return (
    <main className="mx-auto max-w-md p-6">
      <Link
        href="/profile"
        className="mb-6 inline-block text-sm text-gray-600 transition hover:text-black"
      >
        ← До профілю
      </Link>

      <h1 className="text-3xl font-bold">Змінити пароль</h1>

      <p className="mt-2 text-sm leading-6 text-gray-500">
        Для безпеки спочатку введіть поточний пароль, а потім новий.
      </p>

      <UpdatePasswordForm recovery={false} />
    </main>
  );
}
