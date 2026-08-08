import Link from "next/link";

import { createClient } from "@/lib/supabase/server";

const navigationLinkClass =
  "min-w-0 text-center text-[13px] font-medium leading-tight text-gray-700 transition hover:text-black sm:text-sm lg:whitespace-nowrap";

export async function Header() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="mb-4 border-b border-gray-200 pb-4 sm:mb-6 sm:pb-5">
      <div className="flex items-center justify-between gap-3 lg:items-center">
        <div className="min-w-0 shrink">
          <Link href="/" className="inline-block">
            <h1 className="text-3xl font-bold leading-none sm:text-4xl">
              StoneFinder
            </h1>
          </Link>

          <p className="mt-2 hidden text-gray-600 sm:block">
            Знайди або опублікуй залишок каменю.
          </p>
        </div>

        <div className="shrink-0">
          <Link
            href="/add"
            className="inline-flex items-center justify-center whitespace-nowrap rounded-lg bg-black px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800 sm:px-5 sm:py-3"
          >
            <span className="sm:hidden">+ Додати</span>
            <span className="hidden sm:inline">+ Додати оголошення</span>
          </Link>
        </div>
      </div>

      <nav
        aria-label="Основна навігація"
        className="mt-4 grid grid-cols-4 items-center gap-2 sm:flex sm:flex-wrap sm:justify-end sm:gap-x-5 sm:gap-y-3 lg:-mt-9 lg:pr-48"
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
          <Link
            href="/login"
            className="col-span-4 text-right text-sm font-medium text-gray-700 transition hover:text-black sm:ml-auto"
          >
            Увійти
          </Link>
        )}
      </nav>
    </header>
  );
}
