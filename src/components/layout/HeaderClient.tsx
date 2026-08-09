"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Props = {
  isAuthenticated: boolean;
};

const desktopLinkClass =
  "whitespace-nowrap text-sm font-medium text-gray-700 transition hover:text-black";

const mobileLinkClass =
  "min-w-0 text-center text-[13px] font-medium leading-tight text-gray-700 transition hover:text-black sm:text-sm";

const authRoutes = ["/login", "/forgot-password", "/update-password"];

function isAuthRoute(pathname: string) {
  return authRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

export function HeaderTopActions({ isAuthenticated }: Props) {
  const pathname = usePathname();
  const hideLogin = isAuthRoute(pathname);

  return (
    <>
      <div className="hidden items-center gap-5 lg:flex">
        <nav
          aria-label="Основна навігація"
          className="flex items-center gap-5"
        >
          {isAuthenticated ? (
            <>
              <Link href="/my-listings" className={desktopLinkClass}>
                Мої оголошення
              </Link>

              <Link href="/matches" className={desktopLinkClass}>
                Збіги
              </Link>

              <Link href="/favorites" className={desktopLinkClass}>
                Обране
              </Link>

              <Link href="/profile" className={desktopLinkClass}>
                Профіль
              </Link>
            </>
          ) : (
            !hideLogin && (
              <Link href="/login" className={desktopLinkClass}>
                Увійти
              </Link>
            )
          )}
        </nav>

        <Link
          href="/add"
          className="inline-flex items-center justify-center whitespace-nowrap rounded-lg bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
        >
          + Додати оголошення
        </Link>
      </div>

      <div className="flex shrink-0 items-center gap-3 lg:hidden">
        {!isAuthenticated && !hideLogin && (
          <Link
            href="/login"
            className="whitespace-nowrap text-sm font-medium text-gray-700 transition hover:text-black"
          >
            Увійти
          </Link>
        )}

        <Link
          href="/add"
          className="inline-flex items-center justify-center whitespace-nowrap rounded-lg bg-black px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800"
        >
          <span className="sm:hidden">+ Додати</span>
          <span className="hidden sm:inline">+ Додати оголошення</span>
        </Link>
      </div>
    </>
  );
}

export function HeaderMobileNav({ isAuthenticated }: Props) {
  if (!isAuthenticated) {
    return null;
  }

  return (
    <nav
      aria-label="Основна навігація"
      className="mt-4 grid grid-cols-4 items-center gap-2 lg:hidden"
    >
      <Link href="/my-listings" className={mobileLinkClass}>
        Мої оголошення
      </Link>

      <Link href="/matches" className={mobileLinkClass}>
        Збіги
      </Link>

      <Link href="/favorites" className={mobileLinkClass}>
        Обране
      </Link>

      <Link href="/profile" className={mobileLinkClass}>
        Профіль
      </Link>
    </nav>
  );
}
