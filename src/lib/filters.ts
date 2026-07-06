export const materialOptions = [
  { value: "QUARTZ", label: "Кварц" },
  { value: "NATURAL_STONE", label: "Натуральний камінь" },
  { value: "CERAMIC", label: "Кераміка" },
  { value: "ACRYLIC", label: "Акрил" },
  { value: "OTHER", label: "Інше" },
];

import { cities } from "./cities";

export const cityOptions = cities.map((city) => ({
  value: city,
  label: city,
}));
export const sortOptions = [
  { value: "new", label: "Нові" },
  { value: "old", label: "Старі" },
];
