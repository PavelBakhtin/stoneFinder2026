import Link from "next/link";
import { notFound } from "next/navigation";

import { deleteListing } from "@/app/actions";
import { FavoriteButton } from "@/components/listings/FavoriteButton";
import { ListingGallery } from "@/components/listings/ListingGallery";
import { ShareButton } from "@/components/listings/ShareButton";
import { ViewCounter } from "@/components/listings/ViewCounter";
import { formatDimensions } from "@/lib/formatDimensions";
import { createClient } from "@/lib/supabase/server";

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

  const [userResult, profileResult, listingCountResult] = await Promise.all([
    supabase.auth.getUser(),
    supabase
      .rpc("get_public_profile_by_id", { profile_id: listing.user_id })
      .maybeSingle(),
    supabase
      .from("listings")
      .select("id", { count: "exact", head: true })
      .eq("user_id", listing.user_id),
  ]);

  if (profileResult.error) {
    throw new Error(profileResult.error.message);
  }

  if (listingCountResult.error) {
    throw new Error(listingCountResult.error.message);
  }

  const user = userResult.data.user;
  const profile = profileResult.data;
  const authorListingCount = listingCountResult.count ?? 0;
  const isOwner = user?.id === listing.user_id;

  let isFavorite = false;

  if (user) {
    const { data: favorite } = await supabase
      .from("favorites")
      .select("listing_id")
      .eq("user_id", user.id)
      .eq("listing_id", listing.id)
      .maybeSingle();

    isFavorite = Boolean(favorite);
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:py-10">
      <Link
        href="/"
        className="mb-6 inline-flex items-center text-sm text-gray-600 transition hover:text-black"
      >
        ← Назад
      </Link>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)] lg:items-start">
        <section>
          <ListingGallery images={images} alt={listing.decor} />
        </section>

        <aside className="lg:sticky lg:top-6">
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

              <div className="shrink-0">
                <FavoriteButton
                  listingId={listing.id}
                  isAuthenticated={Boolean(user)}
                  initialIsFavorite={isFavorite}
                />
              </div>
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

            {listing.description && (
              <div className="mt-6">
                <h2 className="mb-2 font-semibold">Опис</h2>

                <p className="whitespace-pre-line text-gray-700">
                  {listing.description}
                </p>
              </div>
            )}

            <div className="mt-6 rounded-xl border p-4">
              <p className="text-sm text-gray-500">Автор оголошення</p>

              <p className="mt-1 text-lg font-semibold">
                {profile?.display_name ?? "Користувач"}
              </p>

              {profile?.city && (
                <p className="mt-1 text-sm text-gray-600">📍 {profile.city}</p>
              )}

              <Link
                href={`/user/${listing.user_id}`}
                className="mt-4 block rounded-lg border px-4 py-2.5 text-center text-sm font-medium transition hover:bg-gray-50"
              >
                Інші оголошення ({authorListingCount})
              </Link>
            </div>

            <div className="mt-8 space-y-3">
              <a
                href={`tel:${listing.phone}`}
                className="block rounded-xl bg-black px-4 py-3 text-center font-medium text-white transition hover:bg-gray-800"
              >
                Подзвонити: {listing.phone}
              </a>

              <ShareButton />
            </div>

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

                  <form action={deleteListing.bind(null, listing.id)}>
                    <button
                      type="submit"
                      className="w-full rounded-xl border border-red-300 px-4 py-3 font-medium text-red-600 transition hover:bg-red-50"
                    >
                      Видалити оголошення
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>
    </main>
  );
}
