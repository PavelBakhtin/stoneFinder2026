import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

type SubscriptionBody = {
  endpoint?: unknown;
  keys?: {
    p256dh?: unknown;
    auth?: unknown;
  };
};

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Необхідно увійти" }, { status: 401 });
  }

  const body = (await request.json()) as SubscriptionBody;
  const endpoint = typeof body.endpoint === "string" ? body.endpoint : "";
  const p256dh =
    typeof body.keys?.p256dh === "string" ? body.keys.p256dh : "";
  const auth = typeof body.keys?.auth === "string" ? body.keys.auth : "";

  if (!endpoint || !p256dh || !auth) {
    return NextResponse.json(
      { error: "Некоректна push-підписка" },
      { status: 400 },
    );
  }

  const { error } = await supabase.rpc("save_push_subscription", {
    p_endpoint: endpoint,
    p_p256dh: p256dh,
    p_auth: auth,
    p_user_agent: request.headers.get("user-agent"),
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Необхідно увійти" }, { status: 401 });
  }

  const body = (await request.json()) as { endpoint?: unknown };
  const endpoint = typeof body.endpoint === "string" ? body.endpoint : "";

  if (!endpoint) {
    return NextResponse.json({ error: "Не вказано endpoint" }, { status: 400 });
  }

  const { error } = await supabase
    .from("push_subscriptions")
    .delete()
    .eq("user_id", user.id)
    .eq("endpoint", endpoint);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
