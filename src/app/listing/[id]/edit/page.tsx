import Link from "next/link";
import { notFound, redirect } from "next/navigation";

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

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=/listing/${id}/edit`);
  }

  const { data: listing, error } = await supabase
    .from("listings")
    .select(
      `
        *,
        listing_images (
          image_url,
          position
        )
      `,
    )
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error || !listing) {
    notFound();
  }

  const initialImages =
    listing.listing_images && listing.listing_images.length > 0
      ? listing.listing_images
          .slice()
          .sort(
            (a: { position: number }, b: { position: number }) =>
              a.position - b.position,
          )
          .map((image: { image_url: string }) => image.image_url)
      : listing.image_url
        ? [listing.image_url]
        : [];

  return (
    <main className="mx-auto max-w-2xl p-6">
      <Link
        href={`/listing/${id}`}
        className="mb-6 inline-block text-sm text-gray-600 transition hover:text-black"
      >
        ← Назад
      </Link>

      <h1 className="mb-6 text-3xl font-bold">Редагувати оголошення</h1>

      <ListingForm
        action={updateListing.bind(null, id)}
        listing={listing}
        showImageInput
        initialImages={initialImages}
        buttonText="Зберегти"
      />
    </main>
  );
}
