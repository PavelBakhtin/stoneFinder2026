import webpush from "web-push";

type PushPayload = {
  title: string;
  body: string;
  url?: string;
  tag?: string;
};

let isConfigured = false;

function configureWebPush() {
  if (isConfigured) return;

  const subject = process.env.VAPID_SUBJECT;
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;

  if (!subject || !publicKey || !privateKey) {
    throw new Error(
      "Push notifications are not configured. Check VAPID_SUBJECT, NEXT_PUBLIC_VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY.",
    );
  }

  webpush.setVapidDetails(subject, publicKey, privateKey);
  isConfigured = true;
}

export async function sendPushNotification(
  subscription: {
    endpoint: string;
    p256dh: string;
    auth: string;
  },
  payload: PushPayload,
) {
  configureWebPush();

  return webpush.sendNotification(
    {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: subscription.p256dh,
        auth: subscription.auth,
      },
    },
    JSON.stringify(payload),
  );
}
