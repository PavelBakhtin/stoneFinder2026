import Link from "next/link";

import {
  HeaderMobileNav,
  HeaderTopActions,
} from "@/components/layout/HeaderClient";
import { PushSubscriptionSync } from "@/components/pwa/PushSubscriptionSync";
import { createClient } from "@/lib/supabase/server";

export async function Header() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAuthenticated = Boolean(user);
  let unreadMessagesCount = 0;

  if (user) {
    const { count, error } = await supabase
      .from("messages")
      .select("id", { count: "exact", head: true })
      .eq("recipient_user_id", user.id)
      .is("read_at", null);

    if (error) {
      console.error("Не вдалося порахувати непрочитані повідомлення", error);
    } else {
      unreadMessagesCount = count ?? 0;
    }
  }

  return (
    <header className="mb-4 border-b border-gray-200 pb-4 sm:mb-6 sm:pb-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <Link href="/" className="inline-block">
            <h1 className="text-3xl font-bold leading-none sm:text-4xl">
              StoneFinder
            </h1>
          </Link>

          <p className="mt-2 hidden text-gray-600 sm:block">
            Знайди або опублікуй залишок каменю.
          </p>
        </div>

        <HeaderTopActions
          isAuthenticated={isAuthenticated}
          unreadMessagesCount={unreadMessagesCount}
        />
      </div>

      <HeaderMobileNav isAuthenticated={isAuthenticated} />
      <PushSubscriptionSync isAuthenticated={isAuthenticated} />
    </header>
  );
}
