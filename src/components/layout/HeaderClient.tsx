"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Props = {
  isAuthenticated: boolean;
  unreadMessagesCount?: number;
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

function formatUnreadCount(count: number) {
  return count > 99 ? "99+" : String(count);
}

export function HeaderTopActions({
  isAuthenticated,
  unreadMessagesCount = 0,
}: Props) {
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

              <Link
                href="/messages"
                className={`${desktopLinkClass} inline-flex items-center gap-1.5`}
              >
                <span>Повідомлення</span>
                {unreadMessagesCount > 0 && (
                  <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-black px-1.5 py-0.5 text-[11px] font-bold leading-none text-white">
                    {formatUnreadCount(unreadMessagesCount)}
                  </span>
                )}
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
        {isAuthenticated && (
          <Link
            href="/messages"
            aria-label={
              unreadMessagesCount > 0
                ? `Повідомлення, непрочитаних: ${unreadMessagesCount}`
                : "Повідомлення"
            }
            title="Повідомлення"
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-lg border text-lg transition hover:bg-gray-50"
          >
            <span aria-hidden="true">💬</span>
            {unreadMessagesCount > 0 && (
              <span className="absolute -right-2 -top-2 inline-flex min-w-5 items-center justify-center rounded-full bg-black px-1.5 py-1 text-[10px] font-bold leading-none text-white ring-2 ring-white">
                {formatUnreadCount(unreadMessagesCount)}
              </span>
            )}
          </Link>
        )}

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
