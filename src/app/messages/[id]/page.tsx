import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { ConversationAutoRefresh } from "@/components/messages/ConversationAutoRefresh";
import { ConversationComposer } from "@/components/messages/ConversationComposer";
import { createClient } from "@/lib/supabase/server";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

type ConversationRow = {
  id: string;
  listing_id: string | null;
  listing_owner_user_id: string;
  participant_user_id: string;
  listing_title: string;
};

type MessageRow = {
  id: string;
  sender_user_id: string;
  body: string;
  created_at: string;
};

type PublicProfile = {
  display_name: string | null;
};

function formatMessageTime(value: string) {
  return new Intl.DateTimeFormat("uk-UA", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Kyiv",
  }).format(new Date(value));
}

export default async function ConversationPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=/messages/${id}`);
  }

  const { data: conversationData, error: conversationError } = await supabase
    .from("conversations")
    .select(
      "id, listing_id, listing_owner_user_id, participant_user_id, listing_title",
    )
    .eq("id", id)
    .maybeSingle();

  if (conversationError) {
    throw new Error(conversationError.message);
  }

  if (!conversationData) {
    notFound();
  }

  const conversation = conversationData as ConversationRow;
  const otherUserId =
    conversation.listing_owner_user_id === user.id
      ? conversation.participant_user_id
      : conversation.listing_owner_user_id;

  const [profileResult, messagesResult] = await Promise.all([
    supabase
      .rpc("get_public_profile_by_id", { profile_id: otherUserId })
      .maybeSingle(),
    supabase
      .from("messages")
      .select("id, sender_user_id, body, created_at")
      .eq("conversation_id", conversation.id)
      .order("created_at", { ascending: false })
      .limit(50),
  ]);

  if (messagesResult.error) {
    throw new Error(messagesResult.error.message);
  }

  const profile = profileResult.data as PublicProfile | null;
  const messages = ((messagesResult.data ?? []) as MessageRow[]).reverse();

  return (
    <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:py-10">
      <ConversationAutoRefresh />

      <Link
        href="/messages"
        className="mb-5 inline-flex text-sm font-medium text-gray-600 transition hover:text-black"
      >
        ← Повідомлення
      </Link>

      <section className="overflow-hidden rounded-2xl border bg-white shadow-sm">
        <header className="border-b p-4 sm:p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h1 className="text-xl font-bold">
                {profile?.display_name || "Користувач"}
              </h1>
              <p className="mt-1 truncate text-sm text-gray-600">
                {conversation.listing_title}
              </p>
            </div>

            {conversation.listing_id ? (
              <Link
                href={`/listing/${conversation.listing_id}`}
                className="shrink-0 text-sm font-medium text-gray-600 transition hover:text-black"
              >
                Оголошення →
              </Link>
            ) : (
              <span className="shrink-0 text-xs text-gray-400">
                Оголошення видалено
              </span>
            )}
          </div>
        </header>

        <div className="space-y-3 bg-stone-50 p-4 sm:min-h-[420px] sm:p-5">
          {messages.length === 0 ? (
            <p className="py-10 text-center text-sm text-gray-500">
              Повідомлень немає.
            </p>
          ) : (
            messages.map((message) => {
              const isMine = message.sender_user_id === user.id;

              return (
                <div
                  key={message.id}
                  className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 sm:max-w-[72%] ${
                      isMine
                        ? "bg-black text-white"
                        : "border bg-white text-gray-900"
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
                      {message.body}
                    </p>
                    <p
                      className={`mt-1.5 text-right text-[11px] ${
                        isMine ? "text-gray-300" : "text-gray-400"
                      }`}
                    >
                      {formatMessageTime(message.created_at)}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="p-4 sm:p-5">
          <ConversationComposer conversationId={conversation.id} />
          <p className="mt-2 text-xs text-gray-400">
            Нові повідомлення з’являються автоматично приблизно раз на 12 секунд.
          </p>
        </div>
      </section>
    </main>
  );
}
