import Link from "next/link";

import { DeleteListingButton } from "@/components/listings/DeleteListingButton";
import { FavoriteButton } from "@/components/listings/FavoriteButton";
import { ListingCardGallery } from "@/components/listings/ListingCardGallery";
import { formatDimensions } from "@/lib/formatDimensions";
import type { Listing } from "@/types/listing";

type Props = {
  listing: Listing;
  isFavorite?: boolean;
  isAuthenticated?: boolean;
  refreshFavoriteAfterChange?: boolean;
  showOwnerActions?: boolean;
};

export function ListingCard({
  listing,
  isFavorite = false,
  isAuthenticated = false,
  refreshFavoriteAfterChange = false,
  showOwnerActions = false,
}: Props) {
  const isOffer = listing.listingType === "OFFER";

  const listingTypeClass = isOffer
    ? "bg-green-600 text-white"
    : "bg-orange-500 text-white";

  const listingTypeLabel = isOffer ? "ПРОПОНУЮ" : "ШУКАЮ";

  const topBorderClass = isOffer
    ? "border-t-4 border-green-600"
    : "border-t-4 border-orange-500";

  const images =
    listing.images?.length > 0
      ? listing.images
      : listing.imageUrl
        ? [listing.imageUrl]
        : [];

  const formattedPrice =
    listing.price !== null
      ? `${listing.price.toLocaleString("uk-UA")} ${
          listing.priceCurrency === "USD"
            ? "$"
            : listing.priceCurrency === "EUR"
              ? "€"
              : "грн"
        }`
      : "Договірна";

  return (
    <article
      className={`group relative overflow-hidden rounded-xl border bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${topBorderClass}`}
    >
      <div className="absolute right-3 top-3 z-30 flex gap-2">
        <FavoriteButton
          listingId={listing.id}
          initialIsFavorite={isFavorite}
          isAuthenticated={isAuthenticated}
          refreshAfterChange={refreshFavoriteAfterChange}
        />

        {showOwnerActions && (
          <>
            <Link
              href={`/listing/${listing.id}/edit`}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow transition hover:bg-gray-100"
              title="Редагувати"
              aria-label="Редагувати оголошення"
            >
              ✏️
            </Link>

            <DeleteListingButton listingId={listing.id} />
          </>
        )}
      </div>

      <div className="relative aspect-[4/3] w-full bg-stone-100">
        <ListingCardGallery images={images} alt={listing.decor} />
      </div>

      <Link href={`/listing/${listing.id}`} className="block">
        <div className="space-y-3 p-4">
          <div>
            {listing.manufacturer && (
              <p className="text-sm text-gray-500">{listing.manufacturer}</p>
            )}

            <h2 className="line-clamp-2 text-lg font-bold leading-tight">
              {listing.decor}
            </h2>
          </div>

          <div>
            <span
              className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${listingTypeClass}`}
            >
              {listingTypeLabel}
            </span>
          </div>

          <p className="rounded-lg bg-stone-100 px-3 py-2 text-lg font-bold">
            {formatDimensions(listing.length, listing.width, listing.thickness)}
          </p>

          {isOffer && <p className="text-xl font-semibold">{formattedPrice}</p>}

          <p className="text-sm text-gray-500">{listing.city}</p>
        </div>
      </Link>
    </article>
  );
}
