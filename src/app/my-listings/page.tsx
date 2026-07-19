import { redirect } from "next/navigation";

import { ListingCard } from "@/components/listings/ListingCard";
import { createClient } from "@/lib/supabase/server";
import { ListingStatus, MaterialType } from "@/types/listing";

export default async function MyListingsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data, error } = await supabase
    .from("listings")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const listings =
    data?.map((item) => ({
      id: item.id,
      materialType: item.material_type as MaterialType,
      manufacturer: item.manufacturer,
      decor: item.decor,
      length: item.length,
      width: item.width,
      thickness: item.thickness,
      price: item.price,
      priceCurrency: item.price_currency,
      city: item.city,
      phone: item.phone,
      description: item.description ?? undefined,
      listingType: item.listing_type,
      images: [],
      status: item.status as ListingStatus,
      createdAt: item.created_at,
      imageUrl: item.image_url,
    })) ?? [];

  return (
    <main className="mx-auto max-w-7xl p-6">
      <h1 className="mb-6 text-3xl font-bold">Мої оголошення</h1>

      {listings.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center">
          Ви ще не створили жодного оголошення.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </main>
  );
}
