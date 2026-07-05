import Image from "next/image";
import Link from "next/link";

import { Listing } from "@/types/listing";

type Props = {
  listing: Listing;
};

export function ListingCard({ listing }: Props) {
  return (
    <Link
      href={`/listing/${listing.id}`}
      className="overflow-hidden rounded-xl border bg-white shadow-sm transition hover:shadow-md"
    >
      {listing.imageUrl && (
        <div className="relative h-56 w-full">
          <Image
            src={listing.imageUrl}
            alt={listing.decor}
            fill
            sizes="(max-width: 768px) 100vw, 500px"
            className="object-cover"
          />
        </div>
      )}

      <div className="p-4">
        <p className="text-xl font-bold">
          {listing.price
            ? `${listing.price.toLocaleString()} грн`
            : "Договірна"}
        </p>

        <p className="mt-2 text-sm text-gray-500">{listing.manufacturer}</p>

        <h2 className="text-lg font-semibold">{listing.decor}</h2>

        <p className="mt-2 text-sm">
          {listing.length} × {listing.width} × {listing.thickness} мм
        </p>

        <p className="text-sm text-gray-600">{listing.city}</p>
      </div>
    </Link>
  );
}
