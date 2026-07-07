import { cities } from "@/lib/cities";
import { MaterialFields } from "@/components/listings/MaterialFields";

type ListingFormData = {
  manufacturer: string;
  decor: string;
  material_type: string;
  length: number;
  width: number;
  thickness: number;
  price: number | null;
  city: string;
  phone: string;
  description: string | null;
  price_currency: string | null;
};

type Props = {
  action: (formData: FormData) => void | Promise<void>;
  listing?: ListingFormData;
  showImageInput?: boolean;
  buttonText: string;
};

export function ListingForm({
  action,
  listing,
  showImageInput = false,
  buttonText,
}: Props) {
  return (
    <form action={action} className="space-y-4">
      <MaterialFields
        defaultMaterialType={listing?.material_type}
        defaultManufacturer={listing?.manufacturer}
        defaultDecor={listing?.decor}
      />

      <div className="grid grid-cols-3 gap-3">
        <input
          name="length"
          required
          type="number"
          placeholder="Довжина"
          defaultValue={listing?.length ?? ""}
          className="rounded-lg border p-3"
        />
        <input
          name="width"
          required
          type="number"
          placeholder="Ширина"
          defaultValue={listing?.width ?? ""}
          className="rounded-lg border p-3"
        />
        <input
          name="thickness"
          required
          type="number"
          placeholder="Товщина"
          defaultValue={listing?.thickness ?? ""}
          className="rounded-lg border p-3"
        />
      </div>

      <input
        name="price"
        type="number"
        placeholder="Ціна або порожньо"
        defaultValue={listing?.price ?? ""}
        className="w-full rounded-lg border p-3"
      />
      <select
        name="priceCurrency"
        defaultValue={listing?.price_currency ?? "UAH"}
        className="w-full rounded-lg border p-3"
      >
        <option value="UAH">грн</option>
        <option value="USD">$</option>
        <option value="EUR">€</option>
      </select>
      <select
        name="city"
        required
        defaultValue={listing?.city ?? ""}
        className="w-full rounded-lg border p-3"
      >
        <option value="">Місто</option>
        {cities.map((city) => (
          <option key={city} value={city}>
            {city}
          </option>
        ))}
      </select>

      <input
        name="phone"
        required
        type="tel"
        placeholder="Телефон"
        defaultValue={listing?.phone ?? ""}
        className="w-full rounded-lg border p-3"
      />

      {showImageInput && (
        <input
          name="image"
          type="file"
          accept="image/*"
          className="w-full rounded-lg border bg-white p-3"
        />
      )}

      <textarea
        name="description"
        rows={4}
        placeholder="Опис"
        defaultValue={listing?.description ?? ""}
        className="w-full rounded-lg border p-3"
      />

      <button
        type="submit"
        className="w-full rounded-lg bg-black py-3 text-white"
      >
        {buttonText}
      </button>
    </form>
  );
}
