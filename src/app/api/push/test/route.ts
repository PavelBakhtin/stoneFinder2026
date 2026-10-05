import { NextResponse } from "next/server";

import { sendPushNotification } from "@/lib/push/server";
import { createClient } from "@/lib/supabase/server";

type PushSendError = Error & {
  statusCode?: number;
};

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Необхідно увійти" }, { status: 401 });
  }

  const { data: subscriptions, error } = await supabase
    .from("push_subscriptions")
    .select("endpoint, p256dh, auth")
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!subscriptions || subscriptions.length === 0) {
    return NextResponse.json(
      { error: "На цьому акаунті немає активної push-підписки" },
      { status: 404 },
    );
  }

  let delivered = 0;

  for (const subscription of subscriptions) {
    try {
      await sendPushNotification(subscription, {
        title: "StoneFinder",
        body: "Тестове сповіщення працює. Наступним кроком підключимо збіги.",
        url: "/matches",
        tag: "stonefinder-test",
      });
      delivered += 1;
    } catch (caughtError) {
      const pushError = caughtError as PushSendError;

      if (pushError.statusCode === 404 || pushError.statusCode === 410) {
        await supabase
          .from("push_subscriptions")
          .delete()
          .eq("user_id", user.id)
          .eq("endpoint", subscription.endpoint);
        continue;
      }

      console.error("Не вдалося відправити тестовий push", pushError);
    }
  }

  if (delivered === 0) {
    return NextResponse.json(
      {
        error:
          "Не вдалося доставити push. Спробуйте вимкнути та знову увімкнути сповіщення.",
      },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true, delivered });
}
