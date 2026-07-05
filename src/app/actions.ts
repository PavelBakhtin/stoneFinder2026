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

  const priceValue = formData.get("price")?.toString();

  const { error } = await supabase
    .from("listings")
    .update({
      manufacturer: String(formData.get("manufacturer")),
      decor: String(formData.get("decor")),
      material_type: String(formData.get("materialType")),
      length: Number(formData.get("length")),
      width: Number(formData.get("width")),
      thickness: Number(formData.get("thickness")),
      price: priceValue ? Number(priceValue) : null,
      city: String(formData.get("city")),
      phone: String(formData.get("phone")),
      description: String(formData.get("description") || ""),
    })
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/");
  revalidatePath(`/listing/${id}`);
  redirect("/");
}
