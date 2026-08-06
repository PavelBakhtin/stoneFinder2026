import Link from "next/link";
import { redirect } from "next/navigation";

import { ListingCard } from "@/components/listings/ListingCard";
import { formatDimensions } from "@/lib/formatDimensions";
import { mapListing } from "@/lib/mapListing";
import { createClient } from "@/lib/supabase/server";
import type { Listing } from "@/types/listing";

type MatchRow = {
  source_listing_id: string;
  matched_listing_id: string;
  match_score: number;
};

type MatchGroup = {
  source: Listing;
  matches: Listing[];
};

function getMatchWord(count: number) {
  const lastTwoDigits = count % 100;
  const lastDigit = count % 10;

  if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
    return "збігів";
  }

  if (lastDigit === 1) {
    return "збіг";
  }

  if (lastDigit >= 2 && lastDigit <= 4) {
    return "збіги";
  }

  return "збігів";
}

export default async function MatchesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/matches");
  }

  const { data: matchData, error: matchError } = await supabase.rpc(
    "find_my_listing_matches",
  );

  if (matchError) {
    throw new Error(matchError.message);
  }

  const matchRows = (matchData ?? []) as MatchRow[];

  if (matchRows.length === 0) {
    return (
      <main className="mx-auto max-w-7xl p-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Мої збіги</h1>
            <p className="mt-1 text-gray-600">
              Відповідні оголошення для ваших запитів і залишків.
            </p>
          </div>

          <Link
            href="/my-listings"
            className="rounded-lg border px-4 py-3 text-sm font-medium transition hover:bg-gray-50"
          >
            Мої оголошення
          </Link>
        </div>

        <div className="rounded-xl border border-dashed border-gray-300 bg-white px-6 py-12 text-center">
          <p className="text-lg font-semibold">Збігів поки немає</p>
          <p className="mx-auto mt-2 max-w-xl text-sm text-gray-500">
            Коли з’явиться відповідне оголошення «Шукаю» або «Пропоную», воно
            буде показане тут автоматично.
          </p>
        </div>
      </main>
    );
  }

  const listingIds = Array.from(
    new Set(
      matchRows.flatMap((row) => [
        row.source_listing_id,
        row.matched_listing_id,
      ]),
    ),
  );

  const { data: listingData, error: listingError } = await supabase
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
    .in("id", listingIds);

  if (listingError) {
    throw new Error(listingError.message);
  }

  const listingMap = new Map<string, Listing>();

  for (const row of listingData ?? []) {
    const listing = mapListing(row);
    listingMap.set(listing.id, listing);
  }

  const matchedListingIds = Array.from(
    new Set(matchRows.map((row) => row.matched_listing_id)),
  );

  let favoriteIds = new Set<string>();

  if (matchedListingIds.length > 0) {
    const { data: favoriteData, error: favoriteError } = await supabase
      .from("favorites")
      .select("listing_id")
      .eq("user_id", user.id)
      .in("listing_id", matchedListingIds);

    if (favoriteError) {
      throw new Error(favoriteError.message);
    }

    favoriteIds = new Set(
      favoriteData?.map((favorite) => favorite.listing_id) ?? [],
    );
  }

  const groupMap = new Map<string, MatchGroup>();

  for (const row of matchRows) {
    const source = listingMap.get(row.source_listing_id);
    const matched = listingMap.get(row.matched_listing_id);

    if (!source || !matched) {
      continue;
    }

    const existingGroup = groupMap.get(source.id);

    if (existingGroup) {
      existingGroup.matches.push(matched);
    } else {
      groupMap.set(source.id, {
        source,
        matches: [matched],
      });
    }
  }

  const groups = Array.from(groupMap.values());
  const totalMatches = groups.reduce(
    (total, group) => total + group.matches.length,
    0,
  );

  return (
    <main className="mx-auto max-w-7xl p-6">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Мої збіги</h1>
          <p className="mt-1 text-gray-600">
            Знайдено {totalMatches} відповідних оголошень для ваших публікацій.
          </p>
        </div>

        <Link
          href="/my-listings"
          className="rounded-lg border px-4 py-3 text-sm font-medium transition hover:bg-gray-50"
        >
          Мої оголошення
        </Link>
      </div>

      <div className="space-y-10">
        {groups.map(({ source, matches }) => {
          const isWanted = source.listingType === "WANTED";

          return (
            <section key={source.id} className="rounded-2xl border bg-white p-5">
              <div className="mb-5 flex flex-col gap-4 border-b pb-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    {isWanted
                      ? "Для вашого оголошення «Шукаю»"
                      : "Ваш залишок можуть шукати"}
                  </p>

                  <Link
                    href={`/listing/${source.id}`}
                    className="mt-1 inline-block text-xl font-bold hover:underline"
                  >
                    {source.manufacturer ? `${source.manufacturer} · ` : ""}
                    {source.decor}
                  </Link>

                  <p className="mt-2 text-sm text-gray-600">
                    {formatDimensions(
                      source.length,
                      source.width,
                      source.thickness,
                    )}
                    {source.city ? ` · ${source.city}` : ""}
                  </p>
                </div>

                <div
                  className={`self-start rounded-full px-3 py-1 text-sm font-semibold ${
                    isWanted
                      ? "bg-orange-100 text-orange-800"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  {matches.length} {getMatchWord(matches.length)}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {matches.map((listing) => (
                  <ListingCard
                    key={`${source.id}-${listing.id}`}
                    listing={listing}
                    isAuthenticated
                    isFavorite={favoriteIds.has(listing.id)}
                  />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </main>
  );
}
