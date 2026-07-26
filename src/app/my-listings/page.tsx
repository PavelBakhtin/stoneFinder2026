import { redirect } from "next/navigation";

import { ListingCard } from "@/components/listings/ListingCard";
import { mapListing } from "@/lib/mapListing";
import { createClient } from "@/lib/supabase/server";

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

  const listingIds = data?.map((item) => item.id) ?? [];

  let favoriteIds = new Set<string>();

  if (listingIds.length > 0) {
    const { data: favorites, error: favoritesError } = await supabase
      .from("favorites")
      .select("listing_id")
      .eq("user_id", user.id)
      .in("listing_id", listingIds);

    if (favoritesError) {
      throw new Error(favoritesError.message);
    }

    favoriteIds = new Set(
      favorites?.map((favorite) => favorite.listing_id) ?? [],
    );
  }

  const listings = data?.map(mapListing) ?? [];

  return (
    <main className="mx-auto max-w-7xl p-6">
      <h1 className="mb-6 text-3xl font-bold">Мої оголошення</h1>

      {listings.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white px-6 py-12 text-center">
          <p className="font-medium">Ви ще не створили жодного оголошення</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {listings.map((listing) => (
            <ListingCard
              key={listing.id}
              listing={listing}
              isAuthenticated
              isFavorite={favoriteIds.has(listing.id)}
            />
          ))}
        </div>
      )}
    </main>
  );
}
