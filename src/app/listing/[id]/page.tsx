import Link from "next/link";
import { notFound } from "next/navigation";

import { DeleteListingButton } from "@/components/listings/DeleteListingButton";
import { FavoriteButton } from "@/components/listings/FavoriteButton";
import { ListingGallery } from "@/components/listings/ListingGallery";
import { ShareButton } from "@/components/listings/ShareButton";
import { ViewCounter } from "@/components/listings/ViewCounter";
import { formatDimensions } from "@/lib/formatDimensions";
import { mapListing } from "@/lib/mapListing";
import { createClient } from "@/lib/supabase/server";

type MatchRow = {
  listing_id: string;
  match_score: number;
};

type PublicProfile = {
  id: string;
  display_name: string | null;
  city: string | null;
  phone: string | null;
};

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ListingPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: listing } = await supabase
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
    .eq("id", id)
    .single();

  if (!listing) {
    notFound();
  }

  const images =
    listing.listing_images && listing.listing_images.length > 0
      ? listing.listing_images
          .slice()
          .sort(
            (a: { position: number }, b: { position: number }) =>
              a.position - b.position,
          )
          .map((image: { image_url: string }) => image.image_url)
      : listing.image_url
        ? [listing.image_url]
        : [];

  const [userResult, profileResult, listingCountResult, matchesResult] =
    await Promise.all([
      supabase.auth.getUser(),
      supabase
        .rpc("get_public_profile_by_id", { profile_id: listing.user_id })
        .maybeSingle(),
      supabase
        .from("listings")
        .select("id", { count: "exact", head: true })
        .eq("user_id", listing.user_id),
      supabase.rpc("find_listing_matches", {
        target_listing_id: listing.id,
      }),
    ]);

  if (profileResult.error) {
    throw new Error(profileResult.error.message);
  }

  if (listingCountResult.error) {
    throw new Error(listingCountResult.error.message);
  }

  if (matchesResult.error) {
    throw new Error(matchesResult.error.message);
  }

  const user = userResult.data.user;
  const profile = profileResult.data as PublicProfile | null;
  const authorListingCount = listingCountResult.count ?? 0;
  const isOwner = user?.id === listing.user_id;
  const matchRows = ((matchesResult.data ?? []) as MatchRow[]).slice(0, 5);
  const matchIds = matchRows.map((match) => match.listing_id);

  let isFavorite = false;
  let matchedListings = [] as ReturnType<typeof mapListing>[];

  if (matchIds.length > 0) {
    const { data: matchedRows, error: matchedRowsError } = await supabase
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
      .in("id", matchIds);

    if (matchedRowsError) {
      throw new Error(matchedRowsError.message);
    }

    const matchPosition = new Map(
      matchRows.map((match, index) => [match.listing_id, index]),
    );

    matchedListings = (matchedRows ?? [])
      .map(mapListing)
      .sort(
        (first, second) =>
          (matchPosition.get(first.id) ?? Number.MAX_SAFE_INTEGER) -
          (matchPosition.get(second.id) ?? Number.MAX_SAFE_INTEGER),
      );
  }

  if (user && !isOwner) {
    const { data: favorite, error: favoriteError } = await supabase
      .from("favorites")
      .select("listing_id")
      .eq("user_id", user.id)
      .eq("listing_id", listing.id)
      .maybeSingle();

    if (favoriteError) {
      throw new Error(favoriteError.message);
    }

    isFavorite = Boolean(favorite);
  }

  const matchesBlock =
    matchedListings.length > 0 ? (
      <section
        className={`mt-6 rounded-xl border-2 p-4 ${
          listing.listing_type === "WANTED"
            ? "border-green-200 bg-green-50"
            : "border-orange-200 bg-orange-50"
        }`}
      >
        <div className="mb-4">
          <h2 className="text-lg font-bold">
            {listing.listing_type === "WANTED"
              ? "✓ Є відповідні залишки"
              : "Цей матеріал шукають"}
          </h2>

          <p className="mt-1 text-sm text-gray-600">
            Знайдено: {matchedListings.length}. Натисни на оголошення, щоб
            переглянути деталі.
          </p>
        </div>

        <div className="space-y-2">
          {matchedListings.map((matchedListing) => (
            <Link
              key={matchedListing.id}
              href={`/listing/${matchedListing.id}`}
              className="block rounded-lg border bg-white p-3 transition hover:border-gray-400 hover:shadow-sm"
            >
              {matchedListing.manufacturer && (
                <p className="text-xs text-gray-500">
                  {matchedListing.manufacturer}
                </p>
              )}

              <p className="font-semibold leading-tight">
                {matchedListing.decor}
              </p>

              <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-sm">
                <span className="font-medium">
                  {formatDimensions(
                    matchedListing.length,
                    matchedListing.width,
                    matchedListing.thickness,
                  )}
                </span>

                {matchedListing.listingType === "OFFER" && (
                  <span className="font-semibold">
                    {matchedListing.price !== null
                      ? `${matchedListing.price.toLocaleString("uk-UA")} ${
                          matchedListing.priceCurrency === "USD"
                            ? "$"
                            : matchedListing.priceCurrency === "EUR"
                              ? "€"
                              : "грн"
                        }`
                      : "Договірна"}
                  </span>
                )}
              </div>

              <p className="mt-2 text-xs text-gray-500">
                {matchedListing.city} · Відкрити →
              </p>
            </Link>
          ))}
        </div>
      </section>
    ) : null;

  return (
    <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:py-10">
      <Link
        href="/"
        className="mb-6 inline-flex items-center text-sm text-gray-600 transition hover:text-black"
      >
        ← Назад
      </Link>

      <div
        className={
          images.length > 0
            ? "grid gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)] lg:items-start"
            : "mx-auto max-w-3xl"
        }
      >
        {images.length > 0 && (
          <section>
            <ListingGallery images={images} alt={listing.decor} />
          </section>
        )}

        <aside className={images.length > 0 ? "lg:sticky lg:top-6" : ""}>
          <div className="rounded-2xl border bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                {listing.manufacturer && (
                  <p className="text-sm text-gray-500">
                    {listing.manufacturer}
                  </p>
                )}

                <h1 className="mt-1 break-words text-3xl font-bold leading-tight">
                  {listing.decor}
                </h1>

                <div className="mt-2">
                  <ViewCounter
                    listingId={listing.id}
                    initialViews={listing.views ?? 0}
                  />
                </div>
              </div>

              {!isOwner && (
                <div className="shrink-0">
                  <FavoriteButton
                    listingId={listing.id}
                    isAuthenticated={Boolean(user)}
                    initialIsFavorite={isFavorite}
                  />
                </div>
              )}
            </div>

            <div className="mt-6 border-t pt-6">
              <p className="text-3xl font-bold">
                {listing.price !== null
                  ? `${listing.price.toLocaleString("uk-UA")} ${
                      listing.price_currency === "USD"
                        ? "$"
                        : listing.price_currency === "EUR"
                          ? "€"
                          : "грн"
                    }`
                  : "Договірна"}
              </p>
            </div>

            <div className="mt-6 space-y-3 rounded-xl bg-stone-50 p-4">
              <p className="text-sm text-gray-500">Розміри</p>

              <p className="text-xl font-bold">
                {formatDimensions(
                  listing.length,
                  listing.width,
                  listing.thickness,
                )}
              </p>

              <p className="border-t pt-3 text-gray-700">{listing.city}</p>
            </div>

            {listing.listing_type === "WANTED" && matchesBlock}

            {listing.description && (
              <div className="mt-6">
                <h2 className="mb-2 font-semibold">Опис</h2>

                <p className="whitespace-pre-line text-gray-700">
                  {listing.description}
                </p>
              </div>
            )}

            <Link
              href={`/user/${listing.user_id}`}
              className="mt-6 block rounded-xl border p-4 transition hover:bg-gray-50"
              aria-label="Переглянути оголошення автора"
            >
              <p className="text-sm text-gray-500">Автор оголошення</p>

              <div className="mt-1 flex items-end justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-lg font-semibold">
                    {profile?.display_name ?? "Користувач"}
                  </p>

                  {profile?.city && (
                    <p className="mt-1 text-sm text-gray-600">
                      📍 {profile.city}
                    </p>
                  )}
                </div>

                <p className="shrink-0 pb-0.5 text-right text-sm font-medium text-gray-600">
                  Оголошень: {authorListingCount}
                  <span className="ml-1" aria-hidden="true">
                    →
                  </span>
                </p>
              </div>
            </Link>

            <div className="mt-8 space-y-3">
              <a
                href={`tel:${listing.phone}`}
                className="block rounded-xl bg-black px-4 py-3 text-center font-medium text-white transition hover:bg-gray-800"
              >
                Подзвонити: {listing.phone}
              </a>

              <ShareButton />
            </div>

            {listing.listing_type === "OFFER" && matchesBlock}

            {isOwner && (
              <div className="mt-6 border-t pt-6">
                <p className="mb-3 text-sm font-medium text-gray-500">
                  Керування оголошенням
                </p>

                <div className="space-y-3">
                  <Link
                    href={`/listing/${listing.id}/edit`}
                    className="block rounded-xl border px-4 py-3 text-center font-medium transition hover:bg-gray-50"
                  >
                    Редагувати
                  </Link>

                  <DeleteListingButton
                    listingId={listing.id}
                    variant="full"
                  />
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>
    </main>
  );
}
