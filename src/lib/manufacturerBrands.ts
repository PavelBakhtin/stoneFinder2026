export type ManufacturerBrand = {
  value: string;
  label?: string;
  aliases?: readonly string[];
};

const manufacturerBrands = {
  QUARTZ: [
    { value: "Atem", label: "Atem / Атем", aliases: ["Атем"] },
    {
      value: "Avant",
      label: "Avant / Авант",
      aliases: ["Авант", "Avant Quartz", "Авант Кварц"],
    },
    { value: "Belenco" },
    { value: "Caesarstone", aliases: ["CaesarStone"] },
    { value: "Cimstone", aliases: ["Çimstone", "CimStone"] },
    { value: "Hanstone", aliases: ["HanStone"] },
    { value: "Plazastone", aliases: ["PlazaStone", "Plaza Stone"] },
    { value: "Quarella" },
    { value: "Quartzforms", aliases: ["Quartz Forms"] },
    { value: "Radianz", aliases: ["Samsung Radianz"] },
    { value: "Royal Quartz" },
    { value: "Silestone" },
    { value: "Technistone", aliases: ["TechniStone"] },
    { value: "Tisoro" },
    { value: "Vicostone", aliases: ["VICOSTONE"] },
  ],
  ACRYLIC: [
    { value: "Bienstone" },
    { value: "Corian" },
    { value: "Grandex", aliases: ["GRANDEX"] },
    { value: "Hanex" },
    {
      value: "HI-MACS",
      aliases: ["Hi-Macs", "Hi Macs", "HIMACS", "LG Hi-Macs"],
    },
    { value: "Krion" },
    { value: "Montelli" },
    { value: "Neomarm", aliases: ["NeoMarm", "NEOMARM"] },
    { value: "Staron" },
    { value: "Tristone", aliases: ["TriStone"] },
  ],
  CERAMIC: [
    { value: "Ascale", aliases: ["ASCALE"] },
    { value: "Atlas Plan", aliases: ["Atlas Concorde Plan"] },
    { value: "Dekton", aliases: ["DEKTON"] },
    { value: "Keralini" },
    { value: "Laminam", aliases: ["LAMINAM"] },
    { value: "Neolith", aliases: ["NEOLITH"] },
    {
      value: "SapienStone",
      aliases: ["Sapienstone", "SAPIENSTONE"],
    },
    { value: "XTONE", aliases: ["Xtone", "X-Tone"] },
  ],
} as const satisfies Record<string, readonly ManufacturerBrand[]>;

function normalizeForComparison(value: string) {
  return value.trim().replace(/\s+/g, " ").toLocaleLowerCase("uk-UA");
}

export function getManufacturerBrands(
  materialType: string,
): readonly ManufacturerBrand[] {
  if (
    materialType === "QUARTZ" ||
    materialType === "ACRYLIC" ||
    materialType === "CERAMIC"
  ) {
    return manufacturerBrands[materialType];
  }

  return [];
}

export function getCanonicalManufacturer(
  materialType: string,
  rawValue: string,
) {
  const cleanedValue = rawValue.trim().replace(/\s+/g, " ");

  if (!cleanedValue) {
    return "";
  }

  const normalizedValue = normalizeForComparison(cleanedValue);

  const matchedBrand = getManufacturerBrands(materialType).find((brand) => {
    const variants = [brand.value, ...(brand.aliases ?? [])];

    return variants.some(
      (variant) => normalizeForComparison(variant) === normalizedValue,
    );
  });

  return matchedBrand?.value ?? cleanedValue;
}

export function manufacturerMatchesQuery(
  brand: ManufacturerBrand,
  query: string,
) {
  const normalizedQuery = normalizeForComparison(query);

  if (!normalizedQuery) {
    return true;
  }

  const variants = [brand.value, brand.label ?? "", ...(brand.aliases ?? [])];

  return variants.some((variant) =>
    normalizeForComparison(variant).includes(normalizedQuery),
  );
}

export function getManufacturerDisplayLabel(brand: ManufacturerBrand) {
  return brand.label ?? brand.value;
}
