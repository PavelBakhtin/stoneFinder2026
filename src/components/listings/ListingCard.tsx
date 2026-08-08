import Link from "next/link";

import { DeleteListingButton } from "@/components/listings/DeleteListingButton";
import { FavoriteButton } from "@/components/listings/FavoriteButton";
import { ListingCardGallery } from "@/components/listings/ListingCardGallery";
import { formatDimensions } from "@/lib/formatDimensions";
import { Listing } from "@/types/listing";

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
  const hasImages = listing.images.length > 0;

  const listingClass = isOffer
    ? "bg-green-600 text-white"
    : "bg-orange-500 text-white";

  const listingLabel = isOffer ? "ПРОПОНУЮ" : "ШУКАЮ";

  const topBorderClass = isOffer
    ? "border-1 border-green-600"
    : "border-1 border-orange-500";

  const dimensions = formatDimensions(
    listing.length,
    listing.width,
    listing.thickness,
  );

  return (
    <article
      className={`group relative h-full overflow-hidden rounded-xl border bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${topBorderClass}`}
    >
      <span
        className={`absolute left-3 top-3 z-20 rounded-full px-3 py-1 text-xs font-semibold shadow-sm ${listingClass}`}
      >
        {listingLabel}
      </span>

      <div className="absolute right-3 top-3 z-20 flex gap-2">
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

      <Link href={`/listing/${listing.id}`} className="flex h-full flex-col">
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-stone-100">
          {hasImages ? (
            <ListingCardGallery images={listing.images} alt={listing.decor} />
          ) : (
            <div className="relative h-full w-full overflow-hidden bg-gradient-to-br from-stone-50 via-stone-100 to-stone-200">
              <span className="sr-only">Фото не додано</span>

              <div
                aria-hidden="true"
                className="absolute left-1/2 top-1/2 h-[48%] w-[66%] -translate-x-[46%] -translate-y-[56%] rotate-[-5deg] rounded-xl border border-stone-300/80 bg-white/30"
              />

              <div
                aria-hidden="true"
                className="absolute left-1/2 top-1/2 h-[48%] w-[66%] -translate-x-[54%] -translate-y-[44%] rotate-[3deg] rounded-xl border border-stone-300 bg-white/55 shadow-sm"
              >
                <div className="absolute left-[12%] top-[28%] h-px w-[72%] rotate-[7deg] bg-stone-300/70" />
                <div className="absolute left-[24%] top-[52%] h-px w-[58%] -rotate-[5deg] bg-stone-300/60" />
                <div className="absolute left-[10%] top-[72%] h-px w-[44%] rotate-[3deg] bg-stone-300/50" />
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col space-y-2 p-4">
          <div>
            {listing.manufacturer && (
              <p className="text-sm text-gray-500">{listing.manufacturer}</p>
            )}

            <h2 className="line-clamp-2 text-lg font-bold leading-tight">
              {listing.decor}
            </h2>
          </div>

          <p className="rounded-lg bg-stone-100 px-3 py-2 text-lg font-bold">
            {dimensions}
          </p>

          <div className="mt-auto pt-2">
            <p className="text-2xl font-semibold">
              {listing.price
                ? `${listing.price.toLocaleString()} ${
                    listing.priceCurrency === "USD"
                      ? "$"
                      : listing.priceCurrency === "EUR"
                        ? "€"
                        : "грн"
                  }`
                : "Договірна"}
            </p>

            <p className="mt-2 text-sm text-gray-500">{listing.city}</p>
          </div>
        </div>
      </Link>
    </article>
  );
}
