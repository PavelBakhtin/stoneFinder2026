import {
  Listing,
  ListingStatus,
  ListingType,
  MaterialType,
} from "@/types/listing";

type DatabaseListing = {
  id: string;
  material_type: string;
  manufacturer: string | null;
  decor: string;
  length: number;
  width: number;
  thickness: number | null;
  price: number | null;
  price_currency: string | null;
  city: string;
  phone: string;
  description: string | null;
  listing_type: string;
  status: string;
  created_at: string;
  image_url: string | null;
  listing_images?:
    | {
        image_url: string;
        position: number;
      }[]
    | null;
};

export function mapListing(item: DatabaseListing): Listing {
  return {
    id: item.id,
    materialType: item.material_type as MaterialType,
    manufacturer: item.manufacturer,
    decor: item.decor,
    length: item.length,
    width: item.width,
    thickness: item.thickness,
    price: item.price,
    priceCurrency: item.price_currency,
    city: item.city,
    phone: item.phone,
    description: item.description ?? undefined,
    listingType: item.listing_type as ListingType,
    images:
      item.listing_images && item.listing_images.length > 0
        ? item.listing_images
            .slice()
            .sort((a, b) => a.position - b.position)
            .map((image) => image.image_url)
        : item.image_url
          ? [item.image_url]
          : [],
    status: item.status as ListingStatus,
    createdAt: item.created_at,
    imageUrl: item.image_url,
  };
}
