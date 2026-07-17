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

export async function deleteListing(id: string) {
  const supabase = await createClient();

  const { error } = await supabase.from("listings").delete().eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/");
  redirect("/");
}

export async function updateListing(id: string, formData: FormData) {
  const supabase = await createClient();

  const listingType = String(formData.get("listing_type"));
  const isOffer = listingType === "OFFER";

  const { error } = await supabase
    .from("listings")
    .update({
      listing_type: listingType,

      material_type: String(formData.get("materialType")),
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
    })
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/");
  revalidatePath(`/listing/${id}`);

  redirect("/");
}