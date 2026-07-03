import { Listing } from "@/types/listing";

type Props = {
  listing: Listing;
};

export function ListingCard({ listing }: Props) {
  return (
    <article className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm text-gray-500">
            {listing.manufacturer}
          </p>

          <h2 className="text-lg font-semibold">
            {listing.decor}
          </h2>
        </div>

        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
          {listing.status}
        </span>
      </div>

      <div className="mt-4 space-y-1 text-sm">
        <p>
          📐 {listing.length} × {listing.width} × {listing.thickness} мм
        </p>

        <p>📍 {listing.city}</p>

        <p>{listing.phone}</p>
      </div>
    </article>
  );
}