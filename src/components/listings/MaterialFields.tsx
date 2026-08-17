"use client";

import { useMemo, useState } from "react";

import {
  getCanonicalManufacturer,
  getManufacturerBrands,
  getManufacturerDisplayLabel,
  manufacturerMatchesQuery,
} from "@/lib/manufacturerBrands";

type Props = {
  defaultMaterialType?: string;
  defaultManufacturer?: string;
  defaultDecor?: string;
};

function RequiredMark() {
  return (
    <span className="ml-1 text-red-600" aria-hidden="true">
      *
    </span>
  );
}

export function MaterialFields({
  defaultMaterialType = "QUARTZ",
  defaultManufacturer = "",
  defaultDecor = "",
}: Props) {
  const [materialType, setMaterialType] = useState(defaultMaterialType);
  const [manufacturerInput, setManufacturerInput] =
    useState(defaultManufacturer);
  const [isManufacturerOpen, setIsManufacturerOpen] = useState(false);

  const isNaturalStone = materialType === "NATURAL_STONE";
  const manufacturerBrands = getManufacturerBrands(materialType);
  const hasManufacturerSuggestions = manufacturerBrands.length > 0;

  const filteredManufacturers = useMemo(
    () =>
      manufacturerBrands.filter((brand) =>
        manufacturerMatchesQuery(brand, manufacturerInput),
      ),
    [manufacturerBrands, manufacturerInput],
  );

  const canonicalManufacturer = getCanonicalManufacturer(
    materialType,
    manufacturerInput,
  );

  return (
    <div className="space-y-4">
      <label className="block space-y-1.5">
        <span className="text-sm font-medium">
          Тип матеріалу
          <RequiredMark />
        </span>

        <select
          name="material_type"
          required
          value={materialType}
          onChange={(event) => {
            setMaterialType(event.target.value);
            setManufacturerInput("");
            setIsManufacturerOpen(false);
          }}
          className="w-full rounded-lg border border-gray-300 bg-white p-3"
        >
          <option value="QUARTZ">Кварц</option>
          <option value="NATURAL_STONE">Натуральний камінь</option>
          <option value="ACRYLIC">Акрил</option>
          <option value="CERAMIC">Кераміка</option>
          <option value="OTHER">Інше</option>
        </select>
      </label>

      {!isNaturalStone && (
        <div className="block space-y-1.5">
          <label htmlFor="manufacturer-input" className="text-sm font-medium">
            Виробник
            <RequiredMark />
          </label>

          <div className="relative">
            <input
              id="manufacturer-input"
              type="text"
              required
              autoComplete="off"
              value={manufacturerInput}
              placeholder="Наприклад, Avant"
              onFocus={() => {
                if (hasManufacturerSuggestions) {
                  setIsManufacturerOpen(true);
                }
              }}
              onChange={(event) => {
                setManufacturerInput(event.target.value);

                if (hasManufacturerSuggestions) {
                  setIsManufacturerOpen(true);
                }
              }}
              onBlur={() => {
                window.setTimeout(() => {
                  setManufacturerInput((currentValue) =>
                    getCanonicalManufacturer(materialType, currentValue),
                  );
                  setIsManufacturerOpen(false);
                }, 120);
              }}
              className="w-full rounded-lg border border-gray-300 bg-white p-3"
              aria-autocomplete={
                hasManufacturerSuggestions ? "list" : undefined
              }
              aria-expanded={
                hasManufacturerSuggestions ? isManufacturerOpen : undefined
              }
            />

            <input
              type="hidden"
              name="manufacturer"
              value={canonicalManufacturer}
            />

            {hasManufacturerSuggestions &&
              isManufacturerOpen &&
              filteredManufacturers.length > 0 && (
                <div
                  role="listbox"
                  className="absolute z-20 mt-1 max-h-64 w-full overflow-y-auto rounded-xl border border-gray-200 bg-white p-1 shadow-lg"
                >
                  {filteredManufacturers.map((brand) => (
                    <button
                      key={brand.value}
                      type="button"
                      role="option"
                      aria-selected={
                        canonicalManufacturer === brand.value
                      }
                      onMouseDown={(event) => {
                        event.preventDefault();
                      }}
                      onClick={() => {
                        setManufacturerInput(brand.value);
                        setIsManufacturerOpen(false);
                      }}
                      className="block w-full rounded-lg px-3 py-2.5 text-left text-sm transition hover:bg-gray-100"
                    >
                      {getManufacturerDisplayLabel(brand)}
                    </button>
                  ))}
                </div>
              )}
          </div>

          {hasManufacturerSuggestions && (
            <span className="block text-xs text-gray-500">
              Оберіть зі списку або введіть свій варіант.
            </span>
          )}
        </div>
      )}

      <label className="block space-y-1.5">
        <span className="text-sm font-medium">
          {isNaturalStone ? "Назва каменю" : "Декор"}
          <RequiredMark />
        </span>

        <input
          name="decor"
          required
          type="text"
          placeholder={
            isNaturalStone
              ? "Наприклад, Покостівський граніт"
              : "Наприклад, 7700 Calacatta Marseille"
          }
          defaultValue={defaultDecor}
          className="w-full rounded-lg border border-gray-300 bg-white p-3"
        />
      </label>
    </div>
  );
}
