"use client";

import { useRef, useState } from "react";

import { MaterialFields } from "@/components/listings/MaterialFields";
import CityField from "@/components/listings/CityField";
import { ListingType } from "@/types/listing";

type ListingFormData = {
  manufacturer: string | null;
  decor: string;
  material_type: string;
  length: number;
  width: number;
  thickness: number | null;
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

const commonThicknesses = ["3", "5", "8", "10", "12", "20", "30"];

function getInitialThickness(listing?: ListingFormData) {
  if (listing?.thickness == null) {
    return {
      option: "",
      custom: "",
    };
  }

  const thickness = String(listing.thickness);

  if (commonThicknesses.includes(thickness)) {
    return {
      option: thickness,
      custom: "",
    };
  }

  return {
    option: "other",
    custom: thickness,
  };
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-b border-gray-200 pb-2">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
        {children}
      </h2>
    </div>
  );
}

export function ListingForm({
  action,
  listing,
  showImageInput = false,
  buttonText,
}: Props) {
  const initialThickness = getInitialThickness(listing);

  const [listingType, setListingType] = useState<ListingType>(
    listing?.listing_type ?? ListingType.OFFER,
  );
  const [thicknessOption, setThicknessOption] = useState(
    initialThickness.option,
  );
  const [customThickness, setCustomThickness] = useState(
    initialThickness.custom,
  );
  const [fileName, setFileName] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const isOffer = listingType === ListingType.OFFER;

  const thicknessValue =
    thicknessOption === "other" ? customThickness : thicknessOption;

  return (
    <form action={action} className="space-y-8">
      <section className="space-y-4">
        <SectionTitle>Тип оголошення</SectionTitle>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setListingType(ListingType.OFFER)}
            aria-pressed={isOffer}
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
            aria-pressed={!isOffer}
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
      </section>

      <section className="space-y-4">
        <SectionTitle>Матеріал</SectionTitle>

        <MaterialFields
          defaultMaterialType={listing?.material_type}
          defaultManufacturer={listing?.manufacturer ?? ""}
          defaultDecor={listing?.decor ?? ""}
        />
      </section>

      <section className="space-y-4">
        <SectionTitle>Розміри</SectionTitle>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <label className="space-y-1.5">
            <span className="text-sm font-medium">Довжина, мм</span>

            <input
              name="length"
              required
              type="number"
              min="1"
              max="100000"
              inputMode="numeric"
              placeholder="Наприклад, 1200"
              defaultValue={listing?.length ?? ""}
              className="w-full rounded-lg border p-3 bg-white"
            />
          </label>

          <label className="space-y-1.5">
            <span className="text-sm font-medium ">Ширина, мм</span>

            <input
              name="width"
              required
              type="number"
              min="1"
              max="100000"
              inputMode="numeric"
              placeholder="Наприклад, 600"
              defaultValue={listing?.width ?? ""}
              className="w-full rounded-lg border p-3 bg-white"
            />
          </label>
        </div>

        <div className="space-y-3">
          <label className="block space-y-1.5">
            <span className="text-sm font-medium bg-white">Товщина</span>

            <select
              value={thicknessOption}
              onChange={(event) => {
                const value = event.target.value;

                setThicknessOption(value);

                if (value !== "other") {
                  setCustomThickness("");
                }
              }}
              className="w-full rounded-lg border bg-white p-3"
            >
              <option value="">Не вказано</option>
              <option value="3">3 мм</option>
              <option value="5">5 мм</option>
              <option value="8">8 мм</option>
              <option value="10">10 мм</option>
              <option value="12">12 мм</option>
              <option value="20">20 мм</option>
              <option value="30">30 мм</option>
              <option value="other">Інша товщина…</option>
            </select>
          </label>

          {thicknessOption === "other" && (
            <label className="block space-y-1.5">
              <span className="text-sm font-medium">Вкажіть товщину, мм</span>

              <input
                type="number"
                min="1"
                max="100000"
                step="0.1"
                inputMode="decimal"
                required
                value={customThickness}
                onChange={(event) => setCustomThickness(event.target.value)}
                placeholder="Наприклад, 15"
                className="w-full rounded-lg border p-3"
              />
            </label>
          )}

          <input type="hidden" name="thickness" value={thicknessValue} />
        </div>
      </section>

      {isOffer && (
        <section className="space-y-4">
          <SectionTitle>Ціна</SectionTitle>

          <div className="grid grid-cols-[minmax(0,1fr)_110px] gap-3">
            <input
              name="price"
              type="number"
              min="0"
              step="0.01"
              inputMode="decimal"
              placeholder="Ціна або порожньо"
              defaultValue={listing?.price ?? ""}
              className="min-w-0 rounded-lg border p-3 bg-white"
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
        </section>
      )}

      <section className="space-y-4">
        <SectionTitle>Контакти</SectionTitle>

    
<CityField initialCity={listing?.city} />
      

        <label className="block space-y-1.5">
          <span className="text-sm font-medium">Телефон</span>

          <input
            name="phone"
            required
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="+380..."
            defaultValue={listing?.phone ?? ""}
            className="w-full rounded-lg border p-3 bg-white"
          />
        </label>
      </section>

      {showImageInput && isOffer && (
        <section className="space-y-4">
          <SectionTitle>Фото</SectionTitle>

          <div className="space-y-2">
            <input
              ref={fileInputRef}
              type="file"
              name="image"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(event) => {
                setFileName(event.target.files?.[0]?.name ?? "");
              }}
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full rounded-xl border-2 border-dashed border-gray-300 p-5 text-center font-medium transition hover:border-black hover:bg-gray-50"
            >
              {fileName ? "🖼 Змінити фото" : "🖼 Додати фото залишку"}
            </button>

            <p className="truncate text-sm text-gray-500">
              {fileName || "Фото не вибрано"}
            </p>
          </div>
        </section>
      )}

      <section className="space-y-4">
        <SectionTitle>Опис</SectionTitle>

        <textarea
          name="description"
          rows={4}
          placeholder={
            isOffer
              ? "Додаткова інформація про залишок"
              : "Наприклад: потрібен чистовий розмір, локація не важлива"
          }
          defaultValue={listing?.description ?? ""}
          className="w-full resize-y rounded-lg border p-3 bg-white"
        />
      </section>

      <button
        type="submit"
        className="w-full rounded-lg bg-black py-3 font-medium text-white transition hover:bg-gray-800"
      >
        {buttonText}
      </button>
    </form>
  );
}