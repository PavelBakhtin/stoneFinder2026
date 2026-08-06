import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

type UpdateProfileRequestBody = {
  displayName?: unknown;
  phone?: unknown;
  city?: unknown;
};

export async function PATCH(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: UpdateProfileRequestBody;

  try {
    body = (await request.json()) as UpdateProfileRequestBody;
  } catch {
    return NextResponse.json(
      { error: "Некоректний формат запиту" },
      { status: 400 },
    );
  }

  const displayName =
    typeof body.displayName === "string" ? body.displayName.trim() : "";
  const phone = typeof body.phone === "string" ? body.phone.trim() : "";
  const city = typeof body.city === "string" ? body.city.trim() : "";

  if (!displayName) {
    return NextResponse.json(
      { error: "Вкажіть ім’я або назву майстерні" },
      { status: 400 },
    );
  }

  if (displayName.length > 80) {
    return NextResponse.json(
      { error: "Ім’я або назва майстерні занадто довгі" },
      { status: 400 },
    );
  }

  if (phone.length > 50) {
    return NextResponse.json(
      { error: "Номер телефону занадто довгий" },
      { status: 400 },
    );
  }

  if (city.length > 100) {
    return NextResponse.json(
      { error: "Назва міста занадто довга" },
      { status: 400 },
    );
  }

  const { error } = await supabase.from("profiles").upsert(
    {
      id: user.id,
      display_name: displayName,
      phone: phone || null,
      city: city || null,
    },
    {
      onConflict: "id",
    },
  );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
