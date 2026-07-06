"use client";

import { useState } from "react";

type Props = {
  defaultMaterialType?: string;
  defaultManufacturer?: string;
  defaultDecor?: string;
};

export function MaterialFields({
  defaultMaterialType = "QUARTZ",
  defaultManufacturer = "",
  defaultDecor = "",
}: Props) {
  const [materialType, setMaterialType] = useState(defaultMaterialType);

  const isNaturalStone = materialType === "NATURAL_STONE";

  return (
    <>
      <select
        name="materialType"
        required
        value={materialType}
        onChange={(event) => setMaterialType(event.target.value)}
        className="w-full rounded-lg border p-3"
      >
        <option value="QUARTZ">Кварц</option>
        <option value="NATURAL_STONE">Натуральний камінь</option>
        <option value="ACRYLIC">Акрил</option>
        <option value="CERAMIC">Кераміка</option>
        <option value="OTHER">Інше</option>
      </select>

      {!isNaturalStone && (
        <input
          name="manufacturer"
          required
          type="text"
          placeholder="Бренд"
          defaultValue={defaultManufacturer}
          className="w-full rounded-lg border p-3"
        />
      )}

      <input
        name="decor"
        required
        type="text"
        placeholder={isNaturalStone ? "Назва каменю" : "Декор"}
        defaultValue={defaultDecor}
        className="w-full rounded-lg border p-3"
      />
    </>
  );
}
