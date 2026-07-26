import Image from "next/image";
import Link from "next/link";

import { FavoriteButton } from "@/components/listings/FavoriteButton";
import { formatDimensions } from "@/lib/formatDimensions";
import { listingStatusMap } from "@/lib/listingStatus";
import { Listing } from "@/types/listing";

type Props = {
  listing: Listing;
  isFavorite?: boolean;
  isAuthenticated?: boolean;
  refreshFavoriteAfterChange?: boolean;
};

export function ListingCard({
  listing,
  isFavorite = false,
  isAuthenticated = false,
  refreshFavoriteAfterChange = false,
}: Props) {
  const status = listingStatusMap[listing.status];
  const isOffer = listing.listingType === "OFFER";

  const listingClass = isOffer
    ? "bg-green-600 text-white"
    : "bg-orange-500 text-white";

  const listingLabel = isOffer ? "ПРОПОНУЮ" : "ШУКАЮ";

  const topBorderClass = isOffer
    ? "border-t-4 border-green-600"
    : "border-t-4 border-orange-500";

  return (
    <article
      className={`group relative overflow-hidden rounded-xl border bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${topBorderClass}`}
    >
      <Link href={`/listing/${listing.id}`} className="block">
        <div className="relative aspect-[4/3] w-full bg-stone-100">
          {listing.imageUrl ? (
            <Image
              src={listing.imageUrl}
              alt={listing.decor}
              fill
              className="object-cover transition group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 20vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <span className="text-stone-400">Без фото</span>
            </div>
          )}
        </div>

        <div className="space-y-2 p-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              {listing.manufacturer && (
                <p className="text-sm text-gray-500">{listing.manufacturer}</p>
              )}

              <h2 className="line-clamp-2 text-lg font-bold leading-tight">
                {listing.decor}
              </h2>
            </div>

            {isOffer && (
              <span
                className={`shrink-0 rounded-full px-2 py-1 text-xs font-medium ${status.className}`}
              >
                {status.label}
              </span>
            )}
          </div>

          <div className="flex">
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${listingClass}`}
            >
              {listingLabel}
            </span>
          </div>

          <p className="rounded-lg bg-stone-100 px-3 py-2 text-lg font-bold">
            {formatDimensions(listing.length, listing.width, listing.thickness)}
          </p>

          <div className="mt-4 flex items-center justify-between">
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

            <FavoriteButton
              listingId={listing.id}
              initialIsFavorite={isFavorite}
              isAuthenticated={isAuthenticated}
              refreshAfterChange={refreshFavoriteAfterChange}
              className="absolute right-3 top-3 z-10"
            />
          </div>

          <p className="text-sm text-gray-500">{listing.city}</p>
        </div>
      </Link>
    </article>
  );
}
