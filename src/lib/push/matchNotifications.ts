import { sendPushNotification } from "@/lib/push/server";
import { createAdminClient } from "@/lib/supabase/admin";

type SourceListing = {
  id: string;
  userId: string;
  listingType: string;
  manufacturer: string | null;
  decor: string;
  length: number;
  width: number;
  thickness: number | null;
  city: string;
};

type PushSendError = Error & {
  statusCode?: number;
};

function formatListingName(listing: SourceListing) {
  return listing.manufacturer
    ? `${listing.manufacturer} ${listing.decor}`
    : listing.decor;
}

function formatDimensions(listing: SourceListing) {
  const dimensions = [listing.length, listing.width];

  if (listing.thickness) {
    dimensions.push(listing.thickness);
  }

  return `${dimensions.join(" × ")} мм`;
}

function buildNotification(listing: SourceListing) {
  const listingName = formatListingName(listing);
  const location =
    listing.city && listing.city !== "Вся Україна" ? ` · ${listing.city}` : "";

  if (listing.listingType === "OFFER") {
    return {
      title: "Знайдено потрібний матеріал",
      body: `${listingName} · ${formatDimensions(listing)}${location}`,
    };
  }

  return {
    title: "Ваш матеріал можуть шукати",
    body: `Шукають ${listingName} · ${formatDimensions(listing)}${location}`,
  };
}

export async function notifyMatchedListingOwners({
  sourceListing,
  matchedListingIds,
}: {
  sourceListing: SourceListing;
  matchedListingIds: string[];
}) {
  if (matchedListingIds.length === 0) {
    return;
  }

  try {
    const admin = createAdminClient();

    if (!admin) {
      console.warn(
        "Push match notifications skipped: SUPABASE_SERVICE_ROLE_KEY is not configured.",
      );
      return;
    }

    const uniqueMatchIds = [...new Set(matchedListingIds)];

    const { data: matchedListings, error: matchedListingsError } = await admin
      .from("listings")
      .select("id, user_id")
      .in("id", uniqueMatchIds);

    if (matchedListingsError) {
      console.error(
        "Не вдалося отримати власників оголошень для push",
        matchedListingsError,
      );
      return;
    }

    const recipientIds = [
      ...new Set(
        (matchedListings ?? [])
          .map((listing) => listing.user_id as string)
          .filter(
            (userId) => Boolean(userId) && userId !== sourceListing.userId,
          ),
      ),
    ];

    if (recipientIds.length === 0) {
      return;
    }

    const { data: subscriptions, error: subscriptionsError } = await admin
      .from("push_subscriptions")
      .select("user_id, endpoint, p256dh, auth")
      .in("user_id", recipientIds);

    if (subscriptionsError) {
      console.error(
        "Не вдалося отримати push-підписки для збігів",
        subscriptionsError,
      );
      return;
    }

    const subscriptionsByUser = new Map<
      string,
      Array<{ endpoint: string; p256dh: string; auth: string }>
    >();

    for (const subscription of subscriptions ?? []) {
      const userId = subscription.user_id as string;
      const userSubscriptions = subscriptionsByUser.get(userId) ?? [];

      userSubscriptions.push({
        endpoint: subscription.endpoint as string,
        p256dh: subscription.p256dh as string,
        auth: subscription.auth as string,
      });

      subscriptionsByUser.set(userId, userSubscriptions);
    }

    const notification = buildNotification(sourceListing);

    await Promise.all(
      recipientIds.map(async (recipientUserId) => {
        const { error: claimError } = await admin
          .from("push_match_notifications")
          .insert({
            source_listing_id: sourceListing.id,
            recipient_user_id: recipientUserId,
          });

        if (claimError) {
          // 23505 = this user was already notified about this source listing.
          if (claimError.code !== "23505") {
            console.error("Не вдалося зареєструвати match push", claimError);
          }
          return;
        }

        const userSubscriptions =
          subscriptionsByUser.get(recipientUserId) ?? [];

        if (userSubscriptions.length === 0) {
          return;
        }

        await Promise.all(
          userSubscriptions.map(async (subscription) => {
            try {
              await sendPushNotification(subscription, {
                title: notification.title,
                body: notification.body,
                url: `/listing/${sourceListing.id}`,
                tag: `stonefinder-match-${sourceListing.id}`,
              });
            } catch (caughtError) {
              const pushError = caughtError as PushSendError;

              if (
                pushError.statusCode === 404 ||
                pushError.statusCode === 410
              ) {
                await admin
                  .from("push_subscriptions")
                  .delete()
                  .eq("endpoint", subscription.endpoint);
                return;
              }

              console.error(
                "Не вдалося відправити push про новий збіг",
                pushError,
              );
            }
          }),
        );
      }),
    );
  } catch (caughtError) {
    // Push must never prevent creating a listing.
    console.error("Помилка автоматичних match push-сповіщень", caughtError);
  }
}
