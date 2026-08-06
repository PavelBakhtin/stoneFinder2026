import { notFound } from "next/navigation";

import { ListingCard } from "@/components/listings/ListingCard";
import { mapListing } from "@/lib/mapListing";
import { createClient } from "@/lib/supabase/server";

function getListingsLabel(count: number) {
  const lastTwoDigits = count % 100;
  const lastDigit = count % 10;

  if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
    return `${count} оголошень`;
  }

  if (lastDigit === 1) {
    return `${count} оголошення`;
  }

  if (lastDigit >= 2 && lastDigit <= 4) {
    return `${count} оголошення`;
  }

  return `${count} оголошень`;
}

type Props = {
  params: Promise<{
    id: string;
  }>;
};
type PublicProfile = {
  id: string;
  display_name: string | null;
  city: string | null;
  phone: string | null;
};
export default async function PublicUserPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const [profileResult, listingsResult, userResult] = await Promise.all([
    supabase
      .rpc("get_public_profile_by_id", { profile_id: id })
      .maybeSingle(),
    supabase
      .from("listings")
      .select(
        `
          *,
          listing_images (
            image_url,
            position
          )
        `,
      )
      .eq("user_id", id)
      .order("created_at", { ascending: false }),
    supabase.auth.getUser(),
  ]);

  if (profileResult.error) {
    throw new Error(profileResult.error.message);
  }

  if (listingsResult.error) {
    throw new Error(listingsResult.error.message);
  }
const profile = profileResult.data as PublicProfile | null;
  const listingRows = listingsResult.data ?? [];

  if (!profile && listingRows.length === 0) {
    notFound();
  }

  const listings = listingRows.map(mapListing);
  const currentUser = userResult.data.user;
  const listingIds = listings.map((listing) => listing.id);

  let favoriteIds = new Set<string>();

  if (currentUser && listingIds.length > 0) {
    const { data: favorites, error: favoritesError } = await supabase
      .from("favorites")
      .select("listing_id")
      .eq("user_id", currentUser.id)
      .in("listing_id", listingIds);

    if (favoritesError) {
      throw new Error(favoritesError.message);
    }

    favoriteIds = new Set(
      favorites?.map((favorite) => favorite.listing_id) ?? [],
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:py-10">
      <section className="mb-8 rounded-2xl border bg-white p-5 shadow-sm sm:p-6">
        <p className="text-sm text-gray-500">Користувач</p>

        <h1 className="mt-1 text-3xl font-bold">
          {profile?.display_name ?? "Користувач"}
        </h1>

        <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-gray-600">
          {profile?.city && <span>📍 {profile.city}</span>}
          <span>{getListingsLabel(listings.length)}</span>
        </div>

        {profile?.phone && (
          <a
            href={`tel:${profile.phone.replace(/[^\d+]/g, "")}`}
            className="mt-5 inline-flex items-center justify-center rounded-lg bg-black px-5 py-3 font-medium text-white transition hover:bg-gray-800"
          >
            📞 {profile.phone}
          </a>
        )}
      </section>

      <h2 className="mb-5 text-2xl font-bold">Оголошення користувача</h2>

      {listings.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white px-6 py-12 text-center">
          <p className="font-medium">Активних оголошень поки немає</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {listings.map((listing) => (
            <ListingCard
              key={listing.id}
              listing={listing}
              isAuthenticated={Boolean(currentUser)}
              isFavorite={favoriteIds.has(listing.id)}
              refreshFavoriteAfterChange
            />
          ))}
        </div>
      )}
    </main>
  );
}
