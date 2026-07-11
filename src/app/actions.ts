"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

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
  const priceValue = formData.get("price")?.toString();
  const thicknessValue = formData.get("thickness")?.toString();
  const { error } = await supabase
    .from("listings")
    .update({
      manufacturer: formData.get("manufacturer")
        ? String(formData.get("manufacturer"))
        : null,
      listing_type: String(formData.get("listing_type")),
      decor: String(formData.get("decor")),
      material_type: String(formData.get("materialType")),
      length: Number(formData.get("length")),
      width: Number(formData.get("width")),
      thickness: thicknessValue ? Number(thicknessValue) : null,
      price: listingType === "OFFER" && priceValue ? Number(priceValue) : null,
      city: String(formData.get("city")),
      phone: String(formData.get("phone")),
      description: String(formData.get("description") || ""),
      price_currency:
        listingType === "OFFER"
          ? String(formData.get("price_currency") || "UAH")
          : null,
    })
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/");
  revalidatePath(`/listing/${id}`);
  redirect("/");
}
