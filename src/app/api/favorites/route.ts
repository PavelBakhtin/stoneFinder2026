import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

type FavoriteRequestBody = {
  listingId?: string;
};

export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as FavoriteRequestBody;
  const listingId = body.listingId?.trim();

  if (!listingId) {
    return NextResponse.json(
      { error: "listingId is required" },
      { status: 400 },
    );
  }

  const { data: listing, error: listingError } = await supabase
    .from("listings")
    .select("user_id")
    .eq("id", listingId)
    .maybeSingle();

  if (listingError) {
    return NextResponse.json(
      { error: listingError.message },
      { status: 500 },
    );
  }

  if (!listing) {
    return NextResponse.json(
      { error: "Оголошення не знайдено" },
      { status: 404 },
    );
  }

  if (listing.user_id === user.id) {
    return NextResponse.json(
      { error: "Власне оголошення не можна додати в обране" },
      { status: 400 },
    );
  }

  const { error } = await supabase.from("favorites").insert({
    user_id: user.id,
    listing_id: listingId,
  });

  if (error && error.code !== "23505") {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as FavoriteRequestBody;
  const listingId = body.listingId?.trim();

  if (!listingId) {
    return NextResponse.json(
      { error: "listingId is required" },
      { status: 400 },
    );
  }

  const { error } = await supabase
    .from("favorites")
    .delete()
    .eq("user_id", user.id)
    .eq("listing_id", listingId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
