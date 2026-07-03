import { listings } from "@/lib/mock-data";
import { ListingCard } from "../listings/ListingCard";

export function HomePage() {
  return (
    <main className="mx-auto max-w-6xl p-6">
      <h1 className="mb-8 text-4xl font-bold">
        StoneFinder
      </h1>

      <div className="grid gap-4">
        {listings.map((listing) => (
          <ListingCard
            key={listing.id}
            listing={listing}
          />
        ))}
      </div>
    </main>
  );
}