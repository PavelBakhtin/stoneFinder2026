export enum MaterialType {
  QUARTZ = "QUARTZ",
  NATURAL_STONE = "NATURAL_STONE",
  ACRYLIC = "ACRYLIC",
  CERAMIC = "CERAMIC",
  OTHER = "OTHER",
}

export enum ListingStatus {
  ACTIVE = "ACTIVE",
  RESERVED = "RESERVED",
  SOLD = "SOLD",
}

export interface Listing {
  id: string;

  materialType: MaterialType;

  manufacturer: string;

  decor: string;

  length: number;

  width: number;

  thickness: number;

  city: string;

  phone: string;

  description?: string;

  images: string[];

  status: ListingStatus;

  createdAt: string;

  price: number | null;

  imageUrl: string | null;
}
