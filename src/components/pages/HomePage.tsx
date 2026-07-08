import { ListingCard } from "@/components/listings/ListingCard";
import { createClient } from "@/lib/supabase/server";
import { ListingStatus, MaterialType } from "@/types/listing";
import { SelectFilter } from "@/components/filters/SelectFilter";
import { cityOptions, materialOptions, sortOptions } from "@/lib/filters";
import Link from "next/link";
import { ClearFilters } from "../filters/ClearFilters";

type Props = {
  searchParams?: Promise<{
    q?: string;
    material?: string;
    city?: string;
    sort?: string;
    length?: string;
    width?: string;
  }>;
};

export async function HomePage({ searchParams }: Props) {
  const params = await searchParams;
  const query = params?.q?.trim() ?? "";
  const material = params?.material ?? "";
  const supabase = await createClient();

  let request = supabase.from("listings").select("*");

  const city = params?.city ?? "";

  if (material) {
    request = request.eq("material_type", material);
  }

  if (city) {
    request = request.eq("city", city);
  }
  if (query) {
    request = request.or(
      `manufacturer.ilike.%${query}%,decor.ilike.%${query}%,city.ilike.%${query}%`,
    );
  }
  const sort = params?.sort ?? "new";

  switch (sort) {
    case "old":
      request = request.order("created_at", { ascending: true });
      break;

    default:
      request = request.order("created_at", { ascending: false });
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
      priceCurrency: item.price_currency,
    })) ?? [];

  return (
    <main className="mx-auto max-w-screen-2xl p-6">
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

      <div className="mb-6 space-y-3">
        <form>
          <input
            name="q"
            type="text"
            defaultValue={query}
            placeholder="Пошук (виробник, декор, розміри, місто)"
            className="w-full rounded-xl border border-gray-300 bg-white p-4 text-lg outline-none focus:border-black"
          />
        </form>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <input
            type="number"
            name="length"
            defaultValue={params?.length ?? ""}
            placeholder="Довжина від, мм"
            className="rounded-xl border border-gray-300 bg-white p-3"
          />

          <input
            type="number"
            name="width"
            defaultValue={params?.width ?? ""}
            placeholder="Ширина від, мм"
            className="rounded-xl border border-gray-300 bg-white p-3"
          />
        </div>
        <div className="flex flex-wrap gap-3">
          <SelectFilter
            name="material"
            allowEmpty
            emptyLabel="Усі матеріали"
            options={materialOptions}
          />

          <SelectFilter
            name="city"
            allowEmpty
            emptyLabel="Україна"
            options={cityOptions}
          />

          <SelectFilter name="sort" options={sortOptions} />
          <ClearFilters />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5 2xl:grid-cols-5">
        {listings.map((listing) => (
          <ListingCard key={listing.id} listing={listing} />
        ))}
      </div>
    </main>
  );
}
