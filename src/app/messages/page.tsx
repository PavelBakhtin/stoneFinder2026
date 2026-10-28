import Link from "next/link";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

type ConversationRow = {
  id: string;
  listing_id: string | null;
  listing_owner_user_id: string;
  participant_user_id: string;
  listing_title: string;
  updated_at: string;
};

type PublicProfile = {
  display_name: string | null;
};

function formatUpdatedAt(value: string) {
  return new Intl.DateTimeFormat("uk-UA", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Kyiv",
  }).format(new Date(value));
}

export default async function MessagesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/messages");
  }

  const { data, error } = await supabase
    .from("conversations")
    .select(
      "id, listing_id, listing_owner_user_id, participant_user_id, listing_title, updated_at",
    )
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const conversations = (data ?? []) as ConversationRow[];
  const otherUserIds = [
    ...new Set(
      conversations.map((conversation) =>
        conversation.listing_owner_user_id === user.id
          ? conversation.participant_user_id
          : conversation.listing_owner_user_id,
      ),
    ),
  ];

  const profileEntries = await Promise.all(
    otherUserIds.map(async (userId) => {
      const { data: profile } = await supabase
        .rpc("get_public_profile_by_id", { profile_id: userId })
        .maybeSingle();

      return [userId, (profile as PublicProfile | null)?.display_name] as const;
    }),
  );

  const profileNames = new Map(profileEntries);

  return (
    <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:py-10">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Повідомлення</h1>
          <p className="mt-1 text-sm text-gray-500">
            Діалоги щодо оголошень StoneFinder.
          </p>
        </div>

        <Link
          href="/"
          className="text-sm font-medium text-gray-600 transition hover:text-black"
        >
          На головну
        </Link>
      </div>

      {conversations.length === 0 ? (
        <div className="rounded-2xl border bg-white p-8 text-center shadow-sm">
          <h2 className="text-xl font-semibold">Повідомлень поки немає</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
            Відкрий чуже оголошення та натисни «Написати», щоб почати діалог.
          </p>
          <Link
            href="/"
            className="mt-5 inline-flex rounded-lg bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
          >
            Переглянути оголошення
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
          {conversations.map((conversation, index) => {
            const otherUserId =
              conversation.listing_owner_user_id === user.id
                ? conversation.participant_user_id
                : conversation.listing_owner_user_id;

            return (
              <Link
                key={conversation.id}
                href={`/messages/${conversation.id}`}
                className={`block p-4 transition hover:bg-gray-50 sm:p-5 ${
                  index > 0 ? "border-t" : ""
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-semibold">
                      {profileNames.get(otherUserId) || "Користувач"}
                    </p>
                    <p className="mt-1 truncate text-sm text-gray-600">
                      {conversation.listing_title}
                    </p>
                    {!conversation.listing_id && (
                      <p className="mt-1 text-xs text-gray-400">
                        Оголошення більше недоступне
                      </p>
                    )}
                  </div>

                  <div className="shrink-0 text-right">
                    <p className="text-xs text-gray-400">
                      {formatUpdatedAt(conversation.updated_at)}
                    </p>
                    <span className="mt-2 inline-block text-sm text-gray-500">
                      →
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}
