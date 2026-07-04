import { Listing, ListingStatus, MaterialType } from "../types/listing";

export const listings: Listing[] = [
  {
    id: "1",
    materialType: MaterialType.QUARTZ,
    manufacturer: "Avant",
    decor: "7700 Calacatta Marseille",

    length: 2500,
    width: 700,
    thickness: 20,

    city: "Київ",

    phone: "+380671112233",

    description: "Новий залишок після кухні.",

    images: [],

    status: ListingStatus.ACTIVE,

    createdAt: "2026-07-03",

    price: null,
  },
];