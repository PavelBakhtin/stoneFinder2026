import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { deleteListing } from "@/app/actions";
import { formatDimensions } from "@/lib/formatDimensions";
import { listingStatusMap } from "@/lib/listingStatus";
import { createClient } from "@/lib/supabase/server";
import { ListingStatus } from "@/types/listing";
type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ListingPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: listing } = await supabase
    .from("listings")
    .select("*")
    .eq("id", id)
    .single();

  if (!listing) {
    notFound();
  }

  const status = listingStatusMap[listing.status as ListingStatus];

  return (
    <main className="mx-auto max-w-3xl p-6">
      <Link href="/" className="mb-6 inline-block text-sm text-gray-600">
        ← Назад
      </Link>
      {listing.image_url && (
        <div className="relative mb-6 h-80 w-full overflow-hidden rounded-xl bg-gray-200">
          <Image
            src={listing.image_url}
            alt={listing.decor}
            fill
            priority
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 768px"
            style={{
              maxWidth: "100%",
              height: "auto"
            }} />
        </div>
      )}
<p>      <span
        className={`inline-block rounded-full px-3 py-1 className={tlabelClass} ${status.className}`}
      >
        {status.label}
      </span></p>
      {listing.manufacturer && (
        <p className="mt-4 text-gray-500">{listing.manufacturer}</p>
      )}
      <h1 className="mt-1 text-3xl font-bold">{listing.decor}</h1>
      <p className="mt-6 rounded-xl bg-stone-100 px-4 py-3 text-2xl font-bold">
        {formatDimensions(listing.length, listing.width, listing.thickness)}
      </p>
      <p className="mt-4 text-2xl font-semibold">
        {listing.price
          ? `${listing.price.toLocaleString()} ${
              listing.price_currency === "USD"
                ? "$"
                : listing.price_currency === "EUR"
                  ? "€"
                  : "грн"
            }`
          : "Договірна"}
      </p>
      <p className="mt-4 text-gray-700">
        <strong>Місто:</strong> {listing.city}
      </p>
      {listing.description && (
        <p className="mt-6 whitespace-pre-line text-gray-700">
          {listing.description}
        </p>
      )}
      <a
        href={`tel:${listing.phone}`}
        className="mt-8 block rounded-lg bg-black py-3 text-center font-medium text-white"
      >
        Подзвонити: {listing.phone}
      </a>
      <Link
        href={`/listing/${listing.id}/edit`}
        className="mt-4 block rounded-lg border py-3 text-center font-medium"
      >
        Редагувати
      </Link>
      <form action={deleteListing.bind(null, listing.id)} className="mt-4">
        <button
          type="submit"
          className="w-full rounded-lg border border-red-300 py-3 font-medium text-red-600"
        >
          Видалити оголошення
        </button>
      </form>
    </main>
  );
}
