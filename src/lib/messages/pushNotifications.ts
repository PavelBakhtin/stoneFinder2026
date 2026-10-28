import { createAdminClient } from "@/lib/supabase/admin";
import { sendPushNotification } from "@/lib/push/server";

type PushSendError = Error & {
  statusCode?: number;
};

type ConversationRow = {
  id: string;
  listing_owner_user_id: string;
  participant_user_id: string;
  listing_title: string;
};

type PushSubscriptionRow = {
  endpoint: string;
  p256dh: string;
  auth: string;
};

export async function notifyMessageRecipient({
  conversationId,
  senderUserId,
}: {
  conversationId: string;
  senderUserId: string;
}) {
  try {
    const admin = createAdminClient();

    if (!admin) {
      console.warn(
        "Message push skipped: SUPABASE_SERVICE_ROLE_KEY is not configured.",
      );
      return;
    }

    const { data: conversationData, error: conversationError } = await admin
      .from("conversations")
      .select(
        "id, listing_owner_user_id, participant_user_id, listing_title",
      )
      .eq("id", conversationId)
      .maybeSingle();

    if (conversationError || !conversationData) {
      console.error(
        "Не вдалося отримати діалог для push-повідомлення",
        conversationError,
      );
      return;
    }

    const conversation = conversationData as ConversationRow;
    const recipientUserId =
      conversation.listing_owner_user_id === senderUserId
        ? conversation.participant_user_id
        : conversation.participant_user_id === senderUserId
          ? conversation.listing_owner_user_id
          : null;

    if (!recipientUserId) {
      console.error("Відправник не є учасником діалогу", {
        conversationId,
        senderUserId,
      });
      return;
    }

    const { data: subscriptions, error: subscriptionsError } = await admin
      .from("push_subscriptions")
      .select("endpoint, p256dh, auth")
      .eq("user_id", recipientUserId);

    if (subscriptionsError) {
      console.error(
        "Не вдалося отримати push-підписки отримувача повідомлення",
        subscriptionsError,
      );
      return;
    }

    await Promise.all(
      ((subscriptions ?? []) as PushSubscriptionRow[]).map(
        async (subscription) => {
          try {
            await sendPushNotification(subscription, {
              title: "Нове повідомлення",
              body: `Вам написали щодо ${conversation.listing_title}`,
              url: `/messages/${conversation.id}`,
              // Keep only one current notification per conversation.
              tag: `stonefinder-message-${conversation.id}`,
            });
          } catch (caughtError) {
            const pushError = caughtError as PushSendError;

            if (pushError.statusCode === 404 || pushError.statusCode === 410) {
              await admin
                .from("push_subscriptions")
                .delete()
                .eq("endpoint", subscription.endpoint);
              return;
            }

            console.error(
              "Не вдалося відправити push про нове повідомлення",
              pushError,
            );
          }
        },
      ),
    );
  } catch (caughtError) {
    // Push must never block or roll back a saved message.
    console.error("Помилка push-сповіщення про повідомлення", caughtError);
  }
}
