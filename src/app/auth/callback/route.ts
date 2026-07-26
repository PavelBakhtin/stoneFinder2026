import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);

  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") || "/";

  if (!code) {
    const loginUrl = new URL("/login", requestUrl.origin);

    loginUrl.searchParams.set(
      "error",
      "Не вдалося отримати код авторизації Google",
    );

    return NextResponse.redirect(loginUrl);
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    const loginUrl = new URL("/login", requestUrl.origin);

    loginUrl.searchParams.set("error", error.message);

    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.redirect(new URL(next, requestUrl.origin));
}
