"use client";

import { useState } from "react";
import { cities } from "@/lib/cities";
import { inputClass } from "@/lib/forms";

type Props = {
  initialCity?: string | null;
};

const CUSTOM_VALUE = "__CUSTOM__";

export default function CityField({ initialCity }: Props) {
  const isKnownCity = initialCity && cities.includes(initialCity as (typeof cities)[number]);

  const [selectedCity, setSelectedCity] = useState(
    isKnownCity ? initialCity! : initialCity ? CUSTOM_VALUE : "Вся Україна"
  );

  const [customCity, setCustomCity] = useState(
    isKnownCity ? "" : (initialCity ?? "")
  );

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Місто</label>

      <select
        value={selectedCity}
        onChange={(e) => setSelectedCity(e.target.value)}
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

      {selectedCity === CUSTOM_VALUE && (
        <input
          type="text"
          value={customCity}
          onChange={(e) => setCustomCity(e.target.value)}
          placeholder="Введіть назву населеного пункту"
          className={inputClass}
        />
      )}

      <input
        type="hidden"
        name="city"
        value={selectedCity === CUSTOM_VALUE ? customCity : selectedCity}
      />
    </div>
  );
}