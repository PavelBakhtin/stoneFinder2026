import Link from "next/link";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

async function logout() {
  "use server";

  const supabase = await createClient();

  await supabase.auth.signOut();

  redirect("/");
}

export async function Header() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="mb-6 flex flex-col gap-4 border-b border-gray-200 pb-5 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <Link href="/" className="inline-block">
          <h1 className="mb-2 text-4xl font-bold">StoneFinder</h1>
        </Link>

        <p className="text-gray-600">Знайди або опублікуй залишок каменю.</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {user ? (
          <>
            <span className="max-w-56 truncate text-sm text-gray-600">
              {user.email}
            </span>
            <Link
              href="/my-listings"
              className="rounded-lg border px-4 py-3 text-sm font-medium hover:bg-gray-50"
            >
              Мої оголошення
            </Link>
            <form action={logout}>
              <button
                type="submit"
                className="rounded-lg border border-gray-300 px-4 py-3 text-sm font-medium transition hover:bg-gray-50"
              >
                Вийти
              </button>
            </form>
          </>
        ) : (
          <Link
            href="/login"
            className="rounded-lg border border-gray-300 px-4 py-3 text-sm font-medium transition hover:bg-gray-50"
          >
            Увійти
          </Link>
        )}

        <Link
          href="/add"
          className="rounded-lg bg-black px-4 py-3 text-sm font-medium text-white transition hover:bg-gray-800"
        >
          Додати
        </Link>
      </div>
    </header>
  );
}
