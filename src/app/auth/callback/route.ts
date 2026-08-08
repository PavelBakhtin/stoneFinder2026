import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

function safeNextPath(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/";
  }

  return value;
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);

  const code = requestUrl.searchParams.get("code");
  const next = safeNextPath(requestUrl.searchParams.get("next"));

  if (!code) {
    const loginUrl = new URL("/login", requestUrl.origin);

    loginUrl.searchParams.set(
      "error",
      "Посилання авторизації недійсне або застаріло.",
    );

    return NextResponse.redirect(loginUrl);
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    const loginUrl = new URL("/login", requestUrl.origin);

    loginUrl.searchParams.set(
      "error",
      "Не вдалося завершити авторизацію. Спробуйте ще раз.",
    );

    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.redirect(new URL(next, requestUrl.origin));
}
