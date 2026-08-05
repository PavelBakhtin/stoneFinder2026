import { redirect } from "next/navigation";
import { GoogleLoginButton } from "@/components/auth/GoogleLoginButton";
import { createClient } from "@/lib/supabase/server";

async function login(formData: FormData) {
  "use server";

  const supabase = await createClient();

  const email = String(formData.get("email"));
  const password = String(formData.get("password"));

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  const next = String(formData.get("next") || "/");

  redirect(next);
}

async function signUp(formData: FormData) {
  "use server";

  const supabase = await createClient();

  const email = String(formData.get("email"));
  const password = String(formData.get("password"));

  const { error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  redirect(
    `/login?message=${encodeURIComponent("Перевірте email для підтвердження")}`,
  );
}

type Props = {
  searchParams?: Promise<{
    error?: string;
    message?: string;
    next?: string;
  }>;
};

export default async function LoginPage({ searchParams }: Props) {
  const params = await searchParams;

  return (
    <main className="mx-auto max-w-md p-6">
      <h1 className="mb-6 text-3xl font-bold">Вхід</h1>

      {params?.error && (
        <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {params.error}
        </p>
      )}

      {params?.message && (
        <p className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">
          {params.message}
        </p>
      )}
      <GoogleLoginButton next={params?.next || "/"} />

      <div className="my-5 flex items-center gap-3">
        <div className="h-px flex-1 bg-gray-200" />

        <span className="text-sm text-gray-400">або</span>

        <div className="h-px flex-1 bg-gray-200" />
      </div>
      <form className="space-y-4">
        <input
          name="email"
          type="email"
          required
          placeholder="Email"
          className="w-full rounded-lg border p-3"
        />
        <input type="hidden" name="next" value={params?.next || "/"} />
        <input
          name="password"
          type="password"
          required
          minLength={6}
          placeholder="Пароль"
          className="w-full rounded-lg border p-3"
        />

        <div className="grid grid-cols-2 gap-3">
          <button
            formAction={login}
            className="rounded-lg bg-black py-3 font-medium text-white"
          >
            Увійти
          </button>

          <button
            formAction={signUp}
            className="rounded-lg border py-3 font-medium"
          >
            Реєстрація
          </button>
        </div>
      </form>
    </main>
  );
}
