import Link from "next/link";
import { ListingCard } from "@/components/listings/ListingCard";
import { createClient } from "@/lib/supabase/server";
import { ListingStatus, MaterialType } from "@/types/listing";
import { SearchPanel } from "@/components/filters/SearchPanel";
type Props = {
  searchParams?: Promise<{
    q?: string;
    material?: string;
    city?: string;
    sort?: string;
    lengthFrom?: string;
    lengthTo?: string;
    widthFrom?: string;
    widthTo?: string;
    listingType?: string;
  }>;
};

type ParsedSearch = {
  text: string;
  firstDimension: number | null;
  secondDimension: number | null;
};

function parseSearchQuery(query: string): ParsedSearch {
  const dimensionPattern = /(\d{2,4})\s*[xх×*\/:]\s*(\d{2,4})/i;

  const match = query.match(dimensionPattern);

  if (!match) {
    return {
      text: query.trim(),
      firstDimension: null,
      secondDimension: null,
    };
  }

  const firstDimension = Number(match[1]);
  const secondDimension = Number(match[2]);

  const text = query.replace(match[0], " ").replace(/\s+/g, " ").trim();

  return {
    text,
    firstDimension,
    secondDimension,
  };
}

function sanitizeSearchText(value: string) {
  return value
    .replace(/[^a-zA-Zа-яА-ЯіІїЇєЄґҐ0-9\s._-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export async function HomePage({ searchParams }: Props) {
  const params = await searchParams;

  const query = params?.q?.trim() ?? "";
  const material = params?.material ?? "";
  const city = params?.city ?? "";
  const sort = params?.sort ?? "new";
const listingType = params?.listingType ?? "";
  const lengthFrom = Number(params?.lengthFrom) || 0;
  const lengthTo = Number(params?.lengthTo) || 0;
  const widthFrom = Number(params?.widthFrom) || 0;
  const widthTo = Number(params?.widthTo) || 0;
  const { text, firstDimension, secondDimension } = parseSearchQuery(query);

  const safeText = sanitizeSearchText(text);

  const supabase = await createClient();

  let request = supabase.from("listings").select("*");

  if (material) {
    request = request.eq("material_type", material);
  }

  if (city) {
    request = request.eq("city", city);
  }
  if (listingType) {
  request = request.eq("listing_type", listingType);
}
  if (lengthFrom) {
    request = request.gte("length", lengthFrom);
  }

  if (lengthTo) {
    request = request.lte("length", lengthTo);
  }

  if (widthFrom) {
    request = request.gte("width", widthFrom);
  }

  if (widthTo) {
    request = request.lte("width", widthTo);
  }
  if (firstDimension && secondDimension) {
    request = request.or(
      [
        `and(length.gte.${firstDimension},width.gte.${secondDimension})`,
        `and(length.gte.${secondDimension},width.gte.${firstDimension})`,
      ].join(","),
    );
  }

  if (safeText) {
    request = request.or(
      [
        `manufacturer.ilike.%${safeText}%`,
        `decor.ilike.%${safeText}%`,
        `city.ilike.%${safeText}%`,
      ].join(","),
    );
  }

  request =
    sort === "old"
      ? request.order("created_at", {
          ascending: true,
        })
      : request.order("created_at", {
          ascending: false,
        });

  const { data, error } = await request;

  if (error) {
    throw new Error(error.message);
  }

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
      priceCurrency: item.price_currency,
      city: item.city,
      phone: item.phone,
      description: item.description ?? undefined,
      listingType: item.listing_type,
      images: [],
      status: item.status as ListingStatus,
      createdAt: item.created_at,
      imageUrl: item.image_url,
    })) ?? [];

  return (
    <main className="mx-auto max-w-7xl p-6">
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
        <SearchPanel
        
          key={[
            query,
            material,
            city,
            sort,
            params?.lengthFrom,
            params?.lengthTo,
            params?.widthFrom,
            params?.widthTo,
          ].join("-")}
          initialQuery={query}
          initialMaterial={material}
          initialCity={city}
          initialSort={sort}
          initialLengthFrom={params?.lengthFrom}
          initialLengthTo={params?.lengthTo}
          initialWidthFrom={params?.widthFrom}
          initialWidthTo={params?.widthTo}
          initialListingType={listingType}
        />
      </div>

      {listings.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5 2xl:grid-cols-5">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white px-6 py-12 text-center">
          <p className="font-medium">Нічого не знайдено</p>

          <p className="mt-1 text-sm text-gray-500">
            Спробуй змінити назву матеріалу або потрібний розмір.
          </p>
        </div>
      )}
    </main>
  );
}
