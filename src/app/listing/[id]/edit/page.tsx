import Link from "next/link";
import { notFound } from "next/navigation";

import { updateListing } from "@/app/actions";
import { ListingForm } from "@/components/listings/ListingForm";
import { createClient } from "@/lib/supabase/server";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditListingPage({ params }: Props) {
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
    <main className="mx-auto max-w-2xl p-6">
      <Link
        href={`/listing/${id}`}
        className="mb-6 inline-block text-sm text-gray-600"
      >
        ← Назад
      </Link>

      <h1 className="mb-6 text-3xl font-bold">Редагувати оголошення</h1>

      <ListingForm
        action={updateListing.bind(null, id)}
        listing={listing}
        buttonText="Зберегти"
      />
    </main>
  );
}
