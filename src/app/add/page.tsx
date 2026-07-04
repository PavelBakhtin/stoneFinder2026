import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

async function createListing(formData: FormData) {
  "use server";

  const supabase = await createClient();

  const priceValue = formData.get("price")?.toString();

  const { error } = await supabase.from("listings").insert({
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
  });

  if (error) {
    console.error(error);
    throw new Error(error.message);
  }
  revalidatePath("/");
  redirect("/");
}

export default function AddListingPage() {
  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="mb-6 text-3xl font-bold">Додати оголошення</h1>

      <form action={createListing} className="space-y-4">
        <input
          name="manufacturer"
          required
          type="text"
          placeholder="Виробник"
          className="w-full rounded-lg border p-3"
        />

        <input
          name="decor"
          required
          type="text"
          placeholder="Декор"
          className="w-full rounded-lg border p-3"
        />

        <select
          name="materialType"
          required
          className="w-full rounded-lg border p-3"
        >
          <option value="QUARTZ">Кварц</option>
          <option value="NATURAL_STONE">Натуральний камінь</option>
          <option value="ACRYLIC">Акрил</option>
          <option value="CERAMIC">Кераміка</option>
          <option value="OTHER">Інше</option>
        </select>

        <div className="grid grid-cols-3 gap-3">
          <input
            name="length"
            required
            type="number"
            placeholder="Довжина"
            className="rounded-lg border p-3"
          />
          <input
            name="width"
            required
            type="number"
            placeholder="Ширина"
            className="rounded-lg border p-3"
          />
          <input
            name="thickness"
            required
            type="number"
            placeholder="Товщина"
            className="rounded-lg border p-3"
          />
        </div>

        <input
          name="price"
          type="number"
          placeholder="Ціна або порожньо"
          className="w-full rounded-lg border p-3"
        />

        <select name="city" required className="w-full rounded-lg border p-3">
          <option value="">Місто</option>
          <option value="Київ">Київ</option>
          <option value="Львів">Львів</option>
          <option value="Одеса">Одеса</option>
          <option value="Дніпро">Дніпро</option>
          <option value="Інше">Інше</option>
        </select>

        <input
          name="phone"
          required
          type="tel"
          placeholder="Телефон"
          className="w-full rounded-lg border p-3"
        />

        <textarea
          name="description"
          rows={4}
          placeholder="Опис"
          className="w-full rounded-lg border p-3"
        />

        <button
          type="submit"
          className="w-full rounded-lg bg-black py-3 text-white"
        >
          Опублікувати
        </button>
      </form>
    </main>
  );
}
