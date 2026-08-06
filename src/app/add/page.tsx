import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { ListingForm } from "@/components/listings/ListingForm";
import { createClient } from "@/lib/supabase/server";

async function createListing(formData: FormData) {
  "use server";

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/add");
  }

  const listingType = String(formData.get("listing_type"));
  const thicknessValue = formData.get("thickness")?.toString();
  const priceValue = formData.get("price")?.toString();
  const phone = String(formData.get("phone") || "").trim();

  const imageUrls = [
    ...new Set(
      formData
        .getAll("image_urls")
        .map(String)
        .filter(Boolean),
    ),
  ];

  if (imageUrls.length > 3) {
    throw new Error("Максимум 3 фотографії");
  }

  const { data: newListing, error } = await supabase
    .from("listings")
    .insert({
      user_id: user.id,
      manufacturer: formData.get("manufacturer")
        ? String(formData.get("manufacturer"))
        : null,
      listing_type: listingType,
      decor: String(formData.get("decor")),
      material_type: String(formData.get("material_type")),
      length: Number(formData.get("length")),
      width: Number(formData.get("width")),
      thickness: thicknessValue ? Number(thicknessValue) : null,
      price:
        listingType === "OFFER" && priceValue
          ? Number(priceValue)
          : null,
      city: String(formData.get("city")),
      phone,
      description: String(formData.get("description") || ""),
      image_url: imageUrls[0] ?? null,
      price_currency:
        listingType === "OFFER"
          ? String(formData.get("price_currency") || "UAH")
          : null,
    })
    .select("id")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  if (!newListing) {
    throw new Error("Не вдалося створити оголошення");
  }

  if (imageUrls.length > 0) {
    const { error: imagesError } = await supabase
      .from("listing_images")
      .insert(
        imageUrls.map((imageUrl, position) => ({
          listing_id: newListing.id,
          image_url: imageUrl,
          position,
        })),
      );

    if (imagesError) {
      await supabase
        .from("listings")
        .delete()
        .eq("id", newListing.id)
        .eq("user_id", user.id);

      throw new Error(imagesError.message);
    }
  }

  revalidatePath("/");
  revalidatePath("/my-listings");

  redirect("/");
}

export default async function AddListingPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/add");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("phone, city")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    throw new Error(profileError.message);
  }

  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="mb-2 text-3xl font-bold">
        Додати оголошення
      </h1>

      <p className="mb-6 text-sm text-gray-500">
        Поля, позначені{" "}
        <span className="font-semibold text-red-600">*</span>,
        обов’язкові.
      </p>

      <ListingForm
        action={createListing}
        defaultPhone={profile?.phone ?? ""}
        defaultCity={profile?.city ?? ""}
        showImageInput
        buttonText="Опублікувати"
      />
    </main>
  );
}