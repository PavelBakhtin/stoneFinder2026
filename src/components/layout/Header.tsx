import Link from "next/link";

import { createClient } from "@/lib/supabase/server";

const navigationLinkClass =
  "whitespace-nowrap text-sm font-medium text-gray-700 transition hover:text-black";

export async function Header() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="mb-6 border-b border-gray-200 pb-5">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="shrink-0">
          <Link href="/" className="inline-block">
            <h1 className="mb-2 text-4xl font-bold">StoneFinder</h1>
          </Link>

          <p className="text-gray-600">
            Знайди або опублікуй залишок каменю.
          </p>
        </div>

        <nav
          aria-label="Основна навігація"
          className="flex flex-wrap items-center gap-x-5 gap-y-3"
        >
          {user ? (
            <>
              <Link href="/my-listings" className={navigationLinkClass}>
                Мої оголошення
              </Link>

              <Link href="/matches" className={navigationLinkClass}>
                Збіги
              </Link>

              <Link href="/favorites" className={navigationLinkClass}>
                Обране
              </Link>

              <Link href="/profile" className={navigationLinkClass}>
                Профіль
              </Link>
            </>
          ) : (
            <Link href="/login" className={navigationLinkClass}>
              Увійти
            </Link>
          )}

          <Link
            href="/add"
            className="whitespace-nowrap rounded-lg bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
          >
            + Додати оголошення
          </Link>
        </nav>
      </div>
    </header>
  );
}
