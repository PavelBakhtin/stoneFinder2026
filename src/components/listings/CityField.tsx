"use client";

import { useState } from "react";

import { cities } from "@/lib/cities";
import { inputClass } from "@/lib/forms";

type Props = {
  initialCity?: string | null;
};

const CUSTOM_VALUE = "__CUSTOM__";

export default function CityField({ initialCity }: Props) {
  const isKnownCity = Boolean(
    initialCity &&
      cities.includes(initialCity as (typeof cities)[number]),
  );

  const [selectedCity, setSelectedCity] = useState(
    isKnownCity
      ? initialCity!
      : initialCity
        ? CUSTOM_VALUE
        : "Вся Україна",
  );

  const [customCity, setCustomCity] = useState(
    isKnownCity ? "" : (initialCity ?? ""),
  );

  const cityValue =
    selectedCity === CUSTOM_VALUE
      ? customCity.trim()
      : selectedCity;

  return (
    <div className="space-y-2">
      <label className="block space-y-1.5">
        <span className="text-sm font-medium">
          Місто
          
        </span>

        <select
          value={selectedCity}
          onChange={(event) => {
            setSelectedCity(event.target.value);

            if (event.target.value !== CUSTOM_VALUE) {
              setCustomCity("");
            }
          }}
          className={inputClass}
        >
          {cities.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}

          <option value={CUSTOM_VALUE}>
            Інший населений пункт...
          </option>
        </select>
      </label>

      {selectedCity === CUSTOM_VALUE && (
        <label className="block space-y-1.5">
          <span className="text-sm font-medium">
            Назва населеного пункту
          </span>

          <input
            type="text"
         
            value={customCity}
            onChange={(event) => setCustomCity(event.target.value)}
            placeholder="Введіть назву населеного пункту"
            className={inputClass}
          />
        </label>
      )}

      <input type="hidden" name="city" value={cityValue} />
    </div>
  );
}