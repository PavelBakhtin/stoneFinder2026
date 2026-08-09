"use client";

import { useState } from "react";

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

  const isNaturalStone = materialType === "NATURAL_STONE";

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
          onChange={(event) => setMaterialType(event.target.value)}
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
        <label className="block space-y-1.5">
          <span className="text-sm font-medium">
            Виробник
            <RequiredMark />
          </span>

          <input
            name="manufacturer"
            required
            type="text"
            placeholder="Наприклад, Avant"
            defaultValue={defaultManufacturer}
            className="w-full rounded-lg border border-gray-300 bg-white p-3"
          />
        </label>
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