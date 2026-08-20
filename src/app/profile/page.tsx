import Link from "next/link";
import { redirect } from "next/navigation";

import { ProfileForm } from "@/components/profile/ProfileForm";
import { PendingSubmitButton } from "@/components/ui/PendingSubmitButton";
import { createClient } from "@/lib/supabase/server";

async function logout() {
  "use server";

  const supabase = await createClient();

  await supabase.auth.signOut();

  redirect("/");
}

export default async function ProfilePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/profile");
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("display_name, phone, city")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  const accountName =
    (typeof user.user_metadata?.full_name === "string" &&
      user.user_metadata.full_name) ||
    (typeof user.user_metadata?.name === "string" &&
      user.user_metadata.name) ||
    user.email?.split("@")[0] ||
    "Користувач";

  const providers = Array.isArray(user.app_metadata?.providers)
    ? user.app_metadata.providers
    : [];

  const hasEmailPassword =
    providers.includes("email") || user.app_metadata?.provider === "email";

  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="mb-2 text-3xl font-bold">Мій профіль</h1>

      <p className="mb-6 text-sm text-gray-500">
        Ці дані допоможуть швидше створювати оголошення.
      </p>

      <ProfileForm
        initialDisplayName={profile?.display_name?.trim() || accountName}
        initialPhone={profile?.phone ?? ""}
        initialCity={profile?.city ?? ""}
      />

      <section className="mt-10 border-t border-gray-200 pt-6">
        <h2 className="text-lg font-semibold">Обліковий запис</h2>

        {user.email && (
          <p className="mt-1 text-sm text-gray-500">Вхід: {user.email}</p>
        )}

        <div className="mt-4 grid gap-3 sm:flex sm:flex-wrap">
          {hasEmailPassword && (
            <Link
              href="/update-password"
              className="block w-full rounded-lg border border-gray-300 px-5 py-3 text-center text-sm font-medium transition hover:bg-gray-50 sm:w-auto"
            >
              Змінити пароль
            </Link>
          )}

          <form action={logout} className="w-full sm:w-auto">
            <PendingSubmitButton
              label="Вийти з облікового запису"
              pendingLabel="Виходимо…"
              className="w-full rounded-lg border border-gray-300 px-5 py-3 text-sm font-medium transition hover:bg-gray-50 disabled:cursor-wait disabled:opacity-60 sm:w-auto"
            />
          </form>
        </div>
      </section>
    </main>
  );
}
