import { ListingCard } from "@/components/listings/ListingCard";
import { createClient } from "@/lib/supabase/server";
import { ListingStatus, MaterialType } from "@/types/listing";
import Link from "next/link";

type Props = {
  searchParams?: Promise<{
    q?: string;
  }>;
};

export async function HomePage({ searchParams }: Props) {
  const params = await searchParams;
  const query = params?.q?.trim() ?? "";

  const supabase = await createClient();

  let request = supabase
    .from("listings")
    .select("*")
    .order("created_at", { ascending: false });

  if (query) {
    request = request.or(
      `manufacturer.ilike.%${query}%,decor.ilike.%${query}%,city.ilike.%${query}%`,
    );
  }

  const { data } = await request;

  const listings =
    data?.map((item) => ({
      id: item.id,
      materialType: item.material_type as MaterialType,
      manufacturer: item.manufacturer,
      decor: item.decor,
      length: item.length,
      width: item.width,
      thickness: item.thickness,
      price: item.price,
      city: item.city,
      phone: item.phone,
      description: item.description ?? undefined,
      images: [],
      status: item.status as ListingStatus,
      createdAt: item.created_at,
      imageUrl: item.image_url,
    })) ?? [];

  return (
    <main className="mx-auto max-w-6xl p-6">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="mb-2 text-4xl font-bold">StoneFinder</h1>
          <p className="text-gray-600">Знайди або опублікуй залишок каменю.</p>
        </div>

        <Link
          href="/add"
          className="rounded-lg bg-black px-4 py-3 text-sm font-medium text-white"
        >
          Додати
        </Link>
      </div>

      <form className="mb-6">
        <input
          name="q"
          type="text"
          defaultValue={query}
          placeholder="Пошук за виробником, декором або містом..."
          className="w-full rounded-lg border border-gray-300 bg-white p-3 outline-none focus:border-black"
        />
      </form>

      <div className="grid gap-4">
        {listings.map((listing) => (
          <ListingCard key={listing.id} listing={listing} />
        ))}
      </div>
    </main>
  );
}
