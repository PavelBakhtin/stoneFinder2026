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

  return (
    <Link
      href={`/listing/${listing.id}`}
      className="group overflow-hidden rounded-xl border bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      {listing.imageUrl && (
        <div className="relative aspect-[4/3] w-full bg-gray-100">
          <Image
            src={listing.imageUrl}
            alt={listing.decor}
            fill
            sizes="(max-width: 768px) 100vw, 500px"
            className="object-cover transition group-hover:scale-105"
          />
        </div>
      )}

      <div className="space-y-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            {listing.manufacturer && (
              <p className="text-sm font-medium text-gray-500">
                {listing.manufacturer}
              </p>
            )}

            <h2 className="line-clamp-2 text-lg font-bold leading-tight">
              {listing.decor}
            </h2>
          </div>

          <span
            className={`shrink-0 rounded-full px-2 py-1 text-xs font-medium ${status.className}`}
          >
            {status.label}
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
