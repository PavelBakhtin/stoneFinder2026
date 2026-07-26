import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(_request: Request, { params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { error } = await supabase.rpc("increment_listing_views", {
    listing_id: id,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
