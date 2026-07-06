import Image from "next/image";
import Link from "next/link";
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
      className="overflow-hidden rounded-xl border bg-white shadow-sm transition hover:shadow-md"
    >
      {listing.imageUrl && (
        <div className="relative aspect-[4/3] w-full">
          <Image
            src={listing.imageUrl}
            alt={listing.decor}
            fill
            sizes="(max-width: 768px) 100vw, 500px"
            className="object-cover"
          />
        </div>
      )}
      <span
        className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${status.className}`}
      >
        {status.label}
      </span>
      <div className="p-4">
        {listing.manufacturer && (
          <p className="text-sm font-medium text-gray-500">
            {listing.manufacturer}
          </p>
        )}

        <h2 className="mt-1 text-lg font-bold">{listing.decor}</h2>

        <p className="mt-3 text-lg font-semibold">
          {listing.length} × {listing.width} × {listing.thickness} мм
        </p>

        <p className="mt-2 text-base font-medium">
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
    </Link>
  );
}
