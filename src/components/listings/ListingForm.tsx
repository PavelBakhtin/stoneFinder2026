"use client";

import { useState } from "react";
import { useRef } from "react";
import { MaterialFields } from "@/components/listings/MaterialFields";
import { cities } from "@/lib/cities";
import { ListingType } from "@/types/listing";

type ListingFormData = {
  manufacturer: string | null;
  decor: string;
  material_type: string;
  length: number;
  width: number;
  thickness: number;
  price: number | null;
  price_currency: string | null;
  city: string;
  phone: string;
  description: string | null;
  listing_type: ListingType;
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
  const [listingType, setListingType] = useState<ListingType>(
    listing?.listing_type ?? ListingType.OFFER,
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState("");
  const isOffer = listingType === ListingType.OFFER;

  return (
    <form action={action} className="space-y-4">
      <div className="space-y-2">
        <p className="font-medium">Що ви хочете зробити?</p>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setListingType(ListingType.OFFER)}
            className={`rounded-xl border p-3 font-medium transition ${
              isOffer
                ? "border-black bg-black text-white"
                : "border-gray-300 bg-white hover:bg-gray-50"
            }`}
          >
            Пропоную
          </button>

          <button
            type="button"
            onClick={() => setListingType(ListingType.WANTED)}
            className={`rounded-xl border p-3 font-medium transition ${
              !isOffer
                ? "border-black bg-black text-white"
                : "border-gray-300 bg-white hover:bg-gray-50"
            }`}
          >
            Шукаю
          </button>
        </div>

        <input type="hidden" name="listing_type" value={listingType} />
      </div>

      <MaterialFields
        defaultMaterialType={listing?.material_type}
        defaultManufacturer={listing?.manufacturer ?? ""}
        defaultDecor={listing?.decor ?? ""}
      />

      <div className="grid grid-cols-3 gap-3">
        <input
          name="length"
          required
          type="number"
          min="1"
          placeholder="Довжина"
          defaultValue={listing?.length ?? ""}
          className="min-w-0 rounded-lg border p-3"
        />

        <input
          name="width"
          required
          type="number"
          min="1"
          placeholder="Ширина"
          defaultValue={listing?.width ?? ""}
          className="min-w-0 rounded-lg border p-3"
        />

        <input
          name="thickness"
          type="number"
          min="1"
          placeholder="Товщина (необов'язково)"
          defaultValue={listing?.thickness ?? ""}
          className="min-w-0 rounded-lg border p-3"
        />
      </div>

      {isOffer && (
        <div className="grid grid-cols-[1fr_110px] gap-3">
          <input
            name="price"
            type="number"
            min="0"
            placeholder="Ціна або порожньо"
            defaultValue={listing?.price ?? ""}
            className="min-w-0 rounded-lg border p-3"
          />

          <select
            name="price_currency"
            defaultValue={listing?.price_currency ?? "UAH"}
            className="rounded-lg border bg-white p-3"
          >
            <option value="UAH">грн</option>
            <option value="USD">$</option>
            <option value="EUR">€</option>
          </select>
        </div>
      )}

      <select
        name="city"
        required
        defaultValue={listing?.city ?? ""}
        className="w-full rounded-lg border bg-white p-3"
      >
        <option value="" disabled>
          Місто
        </option>

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

      {showImageInput && isOffer && (
        <div className="space-y-2">
          <p className="text-sm font-medium">Фото залишку (необов&apos;язково)</p>

          <input
            ref={fileInputRef}
            type="file"
            name="image"
            accept="image/*"
            className="hidden"
            onChange={(event) => {
              setFileName(event.target.files?.[0]?.name ?? "");
            }}
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full rounded-xl border-2 border-dashed border-gray-300 p-5 text-center transition hover:border-black hover:bg-gray-50"
          >
            🖼 Додати фото залишку
          </button>

          <p className="text-sm text-gray-500">
            {fileName || "Фото не вибрано"}
          </p>
        </div>
      )}

      <textarea
        name="description"
        rows={4}
        placeholder={
          isOffer
            ? "Додаткова інформація про залишок"
            : "Наприклад: потрібен чистовий розмір, локація не важлива"
        }
        defaultValue={listing?.description ?? ""}
        className="w-full rounded-lg border p-3"
      />

      <button
        type="submit"
        className="w-full rounded-lg bg-black py-3 font-medium text-white hover:bg-gray-800"
      >
        {buttonText}
      </button>
    </form>
  );
}
