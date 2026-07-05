import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteListing } from "@/app/actions";
import { createClient } from "@/lib/supabase/server";

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
            sizes="(max-width: 768px) 100vw, 768px"
            className="object-cover"
          />
        </div>
      )}

      <h1 className="text-3xl font-bold">{listing.decor}</h1>

      <p className="mt-2 text-gray-600">{listing.manufacturer}</p>

      <p className="mt-6 text-3xl font-bold">
        {listing.price ? `${listing.price.toLocaleString()} грн` : "Договірна"}
      </p>

      <div className="mt-6 space-y-2">
        <p>
          <strong>Розмір:</strong> {listing.length} × {listing.width} ×{" "}
          {listing.thickness} мм
        </p>

        <p>
          <strong>Місто:</strong> {listing.city}
        </p>
      </div>

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
