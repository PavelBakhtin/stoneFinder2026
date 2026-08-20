import Link from "next/link";
import { redirect } from "next/navigation";

import {
  ListingTypeFilter,
  ListingTypeTabs,
} from "@/components/listings/ListingTypeTabs";
import { ListingCard } from "@/components/listings/ListingCard";
import { mapListing } from "@/lib/mapListing";
import { createClient } from "@/lib/supabase/server";

type Props = {
  searchParams?: Promise<{
    type?: string;
  }>;
};

function parseType(value?: string): ListingTypeFilter {
  if (value === "offer") {
    return "OFFER";
  }

  if (value === "wanted") {
    return "WANTED";
  }

  return "";
}

export default async function MyListingsPage({ searchParams }: Props) {
  const params = await searchParams;
  const activeType = parseType(params?.type);

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/my-listings");
  }

  const { data, error } = await supabase
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
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const listings = (data ?? []).map(mapListing);

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
      <h1 className="mb-5 text-2xl font-bold sm:text-3xl">Мої оголошення</h1>

      <div className="mb-5 max-w-xl">
        <ListingTypeTabs
          basePath="/my-listings"
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
              ? "У вас поки немає оголошень"
              : activeType === "OFFER"
                ? "Немає оголошень «Пропоную»"
                : "Немає оголошень «Шукаю»"}
          </p>

          {listings.length === 0 && (
            <>
              <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
                Додайте перше оголошення про залишок каменю або матеріал, який
                шукаєте.
              </p>

              <Link
                href="/add"
                className="mt-5 inline-flex items-center justify-center rounded-xl bg-black px-5 py-3 font-semibold text-white transition hover:bg-gray-800"
              >
                + Нове оголошення
              </Link>
            </>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {visibleListings.map((listing) => (
            <ListingCard
              key={listing.id}
              listing={listing}
              isAuthenticated
              showOwnerActions
              hideFavorite
            />
          ))}
        </div>
      )}
    </main>
  );
}
