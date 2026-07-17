import Image from "next/image";
import Link from "next/link";

import { formatDimensions } from "@/lib/formatDimensions";
import { listingStatusMap } from "@/lib/listingStatus";
import { Listing } from "@/types/listing";

type Props = {
  listing: Listing;
};

export function ListingCard({ listing }: Props) {
  const status = listingStatusMap[listing.status];
const isOffer = listing.listingType === "OFFER";

const listingClass = isOffer
  ? "bg-green-600 text-white"
  : "bg-orange-500 text-white";

const listingLabel = isOffer ? "ПРОПОНУЮ" : "ШУКАЮ";

const topBorderClass = isOffer ? "border-t-4 border-green-600" : "border-t-4 border-orange-500";
  return (
    <Link
      href={`/listing/${listing.id}`}
      className={`group overflow-hidden rounded-xl border bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${topBorderClass}`}
    >
      <div className="relative aspect-[4/3] w-full bg-stone-100">
        {listing.imageUrl ? (
          <Image
            src={listing.imageUrl}
            alt={listing.decor}
            fill
            className="object-cover transition group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 500px"
           />
        ) : (
          <div className="flex h-full items-center justify-center bg-stone-100">
            <span className="className={tlabelClass} text-stone-400">Без фото</span>
          </div>
        )}
      </div>
      <div className="space-y-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            {listing.manufacturer && (
              <p className="className={tlabelClass} text-gray-500">
                {listing.manufacturer}
              </p>
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

        <p className="text-base font-medium">
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

        <p className="text-sm text-gray-500">{listing.city}</p>
      </div>
    </Link>
  );
}
