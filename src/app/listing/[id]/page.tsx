import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ShareButton } from "@/components/listings/ShareButton";
import { deleteListing } from "@/app/actions";
import { formatDimensions } from "@/lib/formatDimensions";
import { listingStatusMap } from "@/lib/listingStatus";
import { createClient } from "@/lib/supabase/server";
import { ListingStatus } from "@/types/listing";
import { FavoriteButton } from "@/components/listings/FavoriteButton";
import { ViewCounter } from "@/components/listings/ViewCounter";
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
    .select("*")
    .eq("id", id)
    .single();

  if (!listing) {
    notFound();
  }

  const status = listingStatusMap[listing.status as ListingStatus];
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isFavorite = false;
  const isOwner = user?.id === listing.user_id;
  if (user) {
    const { data: favorite } = await supabase
      .from("favorites")
      .select("listing_id")
      .eq("user_id", user.id)
      .eq("listing_id", listing.id)
      .maybeSingle();

    isFavorite = !!favorite;

    ("");
  }
  return (
    <main className="mx-auto max-w-3xl p-6">
      <Link href="/" className="mb-6 inline-block text-sm text-gray-600">
        ← Назад
      </Link>
      {listing.image_url && (
        <div className="relative mb-6 h-80 w-full overflow-hidden rounded-xl bg-gray-200">
          <Image
            src={listing.image_url}
            alt={listing.decor}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 768px"
          />
        </div>
      )}
      <div className="mb-6 flex items-center justify-between gap-4">
        <p>
          {" "}
          <span
            className={`inline-block rounded-full px-3 py-1 ${status.className}`}
          >
            {status.label}
          </span>
        </p>
        <FavoriteButton
          listingId={listing.id}
          isAuthenticated={Boolean(user)}
          initialIsFavorite={isFavorite}
        />
      </div>

      {listing.manufacturer && (
        <p className="mt-4 text-gray-500">{listing.manufacturer}</p>
      )}
      <h1 className="mt-1 text-3xl font-bold">{listing.decor}</h1>

      <div className="mt-2">
        <ViewCounter listingId={listing.id} initialViews={listing.views ?? 0} />
      </div>

      <p className="mt-4 text-2xl font-semibold">
        {listing.price
          ? `${listing.price.toLocaleString()} ${
              listing.price_currency === "USD"
                ? "$"
                : listing.price_currency === "EUR"
                  ? "€"
                  : "грн"
            }`
          : "Договірна"}
      </p>
      <p className="mt-4 text-gray-700">
        <strong>Місто:</strong> {listing.city}
      </p>
      {listing.description && (
        <p className="mt-6 whitespace-pre-line text-gray-700">
          {listing.description}
        </p>
      )}

      <a
        href={`tel:${listing.phone}`}
        className="mt-8 block rounded-lg bg-black py-3 text-center font-medium text-white"
      >
        Подзвонити: {listing.phone}
      </a>
      <ShareButton />
      {isOwner && (
        <>
          <Link
            href={`/listing/${listing.id}/edit`}
            className="mt-4 block rounded-lg border py-3 text-center font-medium"
          >
            Редагувати
          </Link>

          <form action={deleteListing.bind(null, listing.id)} className="mt-4">
            <button
              type="submit"
              className="w-full rounded-lg border border-red-300 py-3 font-medium text-red-600"
            >
              Видалити оголошення
            </button>
          </form>
        </>
      )}
    </main>
  );
}
