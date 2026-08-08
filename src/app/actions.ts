"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

function getOptionalString(formData: FormData, field: string) {
  const value = formData.get(field)?.toString().trim();

  return value ? value : null;
}

function getOptionalNumber(formData: FormData, field: string) {
  const value = formData.get(field)?.toString().trim();

  if (!value) {
    return null;
  }

  const parsedValue = Number(value);

  return Number.isFinite(parsedValue) ? parsedValue : null;
}

function getStoragePath(publicUrl: string) {
  const marker = "/storage/v1/object/public/listing-images/";
  const markerIndex = publicUrl.indexOf(marker);

  if (markerIndex === -1) {
    return null;
  }

  return decodeURIComponent(
    publicUrl.slice(markerIndex + marker.length),
  );
}

export async function deleteListing(id: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { error } = await supabase
    .from("listings")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/");
  revalidatePath("/my-listings");
  revalidatePath("/matches");

  redirect("/");
}

export async function updateListing(id: string, formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=/listing/${id}/edit`);
  }

  const { data: existingListing, error: existingListingError } =
    await supabase
      .from("listings")
      .select(
        `
          id,
          user_id,
          image_url,
          listing_images (
            image_url
          )
        `,
      )
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

  if (existingListingError || !existingListing) {
    throw new Error("Оголошення не знайдено або немає доступу");
  }

  const listingType = String(formData.get("listing_type"));
  const isOffer = listingType === "OFFER";

  const imageUrls = isOffer
    ? [
        ...new Set(
          formData
            .getAll("image_urls")
            .map(String)
            .filter(Boolean),
        ),
      ]
    : [];

  if (imageUrls.length > 3) {
    throw new Error("Максимум 3 фотографії");
  }

  const oldImageUrls =
    existingListing.listing_images &&
    existingListing.listing_images.length > 0
      ? existingListing.listing_images.map(
          (image: { image_url: string }) => image.image_url,
        )
      : existingListing.image_url
        ? [existingListing.image_url]
        : [];

  const { error: updateError } = await supabase
    .from("listings")
    .update({
      listing_type: listingType,
      material_type: String(formData.get("material_type")),
      manufacturer: getOptionalString(formData, "manufacturer"),
      decor: String(formData.get("decor")).trim(),
      length: Number(formData.get("length")),
      width: Number(formData.get("width")),
      thickness: getOptionalNumber(formData, "thickness"),
      price: isOffer ? getOptionalNumber(formData, "price") : null,
      price_currency: isOffer
        ? String(formData.get("price_currency") || "UAH")
        : null,
      city: String(formData.get("city")),
      phone: String(formData.get("phone")).trim(),
      description: getOptionalString(formData, "description"),
      image_url: imageUrls[0] ?? null,
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (updateError) {
    throw new Error(updateError.message);
  }

  const { error: deleteImagesError } = await supabase
    .from("listing_images")
    .delete()
    .eq("listing_id", id);

  if (deleteImagesError) {
    throw new Error(deleteImagesError.message);
  }

  if (imageUrls.length > 0) {
    const { error: insertImagesError } = await supabase
      .from("listing_images")
      .insert(
        imageUrls.map((imageUrl, position) => ({
          listing_id: id,
          image_url: imageUrl,
          position,
        })),
      );

    if (insertImagesError) {
      throw new Error(insertImagesError.message);
    }
  }

  // Best effort: physically remove files that the user removed from the listing.
  // If Storage DELETE policy is not configured, the listing still saves correctly.
  const removedPaths = oldImageUrls
    .filter((oldUrl: string) => !imageUrls.includes(oldUrl))
    .map(getStoragePath)
    .filter((path): path is string => Boolean(path));

  if (removedPaths.length > 0) {
    await supabase.storage.from("listing-images").remove(removedPaths);
  }

  revalidatePath("/");
  revalidatePath("/my-listings");
  revalidatePath("/matches");
  revalidatePath(`/listing/${id}`);
  revalidatePath(`/user/${user.id}`);

  redirect(`/listing/${id}`);
}
