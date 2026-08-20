import { redirect } from "next/navigation";
import { mapListing } from "@/lib/mapListing";
import { ListingCard } from "@/components/listings/ListingCard";
import { createClient } from "@/lib/supabase/server";
export default async function FavoritesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: favorites, error: favoritesError } = await supabase
    .from("favorites")
    .select("listing_id")
    .eq("user_id", user.id);

  if (favoritesError) {
    throw new Error(favoritesError.message);
  }

  const ids = favorites?.map((item) => item.listing_id) ?? [];

  if (ids.length === 0) {
    return (
      <main className="mx-auto max-w-7xl p-6">
        <h1 className="mb-6 text-3xl font-bold">Обране</h1>

        <div className="rounded-xl border border-dashed border-gray-300 bg-white px-6 py-12 text-center">
          <p className="font-medium">В обраному поки порожньо</p>

          <p className="mt-1 text-sm text-gray-500">
            Натисніть ❤️ на потрібному оголошенні.
          </p>
        </div>
      </main>
    );
  }

  const { data, error } = await supabase
    .from("listings")
    .select("*")
    .in("id", ids)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const listings =
    data
      ?.filter((listing) => listing.user_id !== user.id)
      .map(mapListing) ?? [];
  return (
    <main className="mx-auto max-w-7xl p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Обране</h1>

        <p className="mt-1 text-gray-600">Збережені оголошення.</p>
      </div>

      {listings.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white px-6 py-12 text-center">
          <p className="font-medium">В обраному поки порожньо</p>

          <p className="mt-1 text-sm text-gray-500">
            Натисніть сердечко на потрібному оголошенні.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {listings.map((listing) => (
            <ListingCard
              key={listing.id}
              listing={listing}
              isAuthenticated
              isFavorite
              refreshFavoriteAfterChange
            />
          ))}
        </div>
      )}
    </main>
  );
}
