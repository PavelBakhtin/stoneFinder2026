import { notFound } from "next/navigation";

import {
  ListingTypeFilter,
  ListingTypeTabs,
} from "@/components/listings/ListingTypeTabs";
import { ListingCard } from "@/components/listings/ListingCard";
import { mapListing } from "@/lib/mapListing";
import { createClient } from "@/lib/supabase/server";

type PublicProfile = {
  id: string;
  display_name: string | null;
  city: string | null;
  phone: string | null;
};

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

function parseType(value?: string): ListingTypeFilter {
  if (value === "offer") {
    return "OFFER";
  }

  if (value === "wanted") {
    return "WANTED";
  }

  return "";
}

type Props = {
  params: Promise<{
    id: string;
  }>;
  searchParams?: Promise<{
    type?: string;
  }>;
};

export default async function PublicUserPage({
  params,
  searchParams,
}: Props) {
  const { id } = await params;
  const queryParams = await searchParams;
  const activeType = parseType(queryParams?.type);

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

  const isOwnProfile = currentUser?.id === id;

  if (currentUser && !isOwnProfile && listingIds.length > 0) {
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

  const offerCount = listings.filter(
    (listing) => listing.listingType === "OFFER",
  ).length;

  const wantedCount = listings.filter(
    (listing) => listing.listingType === "WANTED",
  ).length;

  const visibleListings = activeType
    ? listings.filter((listing) => listing.listingType === activeType)
    : listings;

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

      <h2 className="mb-4 text-2xl font-bold">Оголошення користувача</h2>

      <div className="mb-5 max-w-xl">
        <ListingTypeTabs
          basePath={`/user/${id}`}
          activeType={activeType}
          allCount={listings.length}
          offerCount={offerCount}
          wantedCount={wantedCount}
        />
      </div>

      {visibleListings.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white px-6 py-12 text-center">
          <p className="font-medium">
            {listings.length === 0
              ? "Активних оголошень поки немає"
              : activeType === "OFFER"
                ? "Немає оголошень «Пропоную»"
                : "Немає оголошень «Шукаю»"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {visibleListings.map((listing) => (
            <ListingCard
              key={listing.id}
              listing={listing}
              isAuthenticated={Boolean(currentUser)}
              isFavorite={favoriteIds.has(listing.id)}
              refreshFavoriteAfterChange
              hideFavorite={isOwnProfile}
            />
          ))}
        </div>
      )}
    </main>
  );
}
