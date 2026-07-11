import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { ListingForm } from "@/components/listings/ListingForm";
import { createClient } from "@/lib/supabase/server";

async function createListing(formData: FormData) {
  "use server";

  const supabase = await createClient();

  const priceValue = formData.get("price")?.toString();
  const imageFile = formData.get("image") as File | null;
  const listingType = String(formData.get("listing_type"));
  const thicknessValue = formData.get("thickness")?.toString();
  let imageUrl: string | null = null;

  if (listingType === "OFFER" && imageFile && imageFile.size > 0) {
    const fileExt = imageFile.name.split(".").pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `listings/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("listing-images")
      .upload(filePath, imageFile);

    if (uploadError) throw new Error(uploadError.message);

    const { data } = supabase.storage
      .from("listing-images")
      .getPublicUrl(filePath);

    imageUrl = data.publicUrl;
  }

  const { error } = await supabase.from("listings").insert({
    manufacturer: formData.get("manufacturer")
      ? String(formData.get("manufacturer"))
      : null,
    listing_type: String(formData.get("listing_type")),
    decor: String(formData.get("decor")),
    material_type: String(formData.get("material_type")),
    length: Number(formData.get("length")),
    width: Number(formData.get("width")),
    thickness: thicknessValue ? Number(thicknessValue) : null,
    price: listingType === "OFFER" && priceValue ? Number(priceValue) : null,
    city: String(formData.get("city")),
    phone: String(formData.get("phone")),
    description: String(formData.get("description") || ""),
    image_url: imageUrl,
    price_currency:
      listingType === "OFFER"
        ? String(formData.get("price_currency") || "UAH")
        : null,
  });

  if (error) throw new Error(error.message);

  revalidatePath("/");
  redirect("/");
}

export default function AddListingPage() {
  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="mb-6 text-3xl font-bold">Додати оголошення</h1>

      <ListingForm
        action={createListing}
        showImageInput
        buttonText="Опублікувати"
      />
    </main>
  );
}
