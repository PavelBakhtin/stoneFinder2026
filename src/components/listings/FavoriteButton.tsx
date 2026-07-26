"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  listingId: string;
  initialIsFavorite: boolean;
  isAuthenticated: boolean;
  className?: string;
  refreshAfterChange?: boolean;
};

export function FavoriteButton({
  listingId,
  initialIsFavorite,
  isAuthenticated,
  className = "",
  refreshAfterChange = false,
}: Props) {
  const router = useRouter();

  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
  const [isPending, setIsPending] = useState(false);

  async function handleClick(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();

    if (isPending) {
      return;
    }

    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    const previousValue = isFavorite;
    const nextValue = !previousValue;

    setIsFavorite(nextValue);
    setIsPending(true);

    try {
      const response = await fetch("/api/favorites", {
        method: nextValue ? "POST" : "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          listingId,
        }),
      });
      if (refreshAfterChange) {
        router.refresh();
      }
      if (response.status === 401) {
        setIsFavorite(previousValue);
        router.push("/login");
        return;
      }

      if (!response.ok) {
        const result = (await response.json()) as {
          error?: string;
        };

        throw new Error(result.error || "Favorite request failed");
      }
    } catch (error) {
      setIsFavorite(previousValue);
      console.error("Favorite error:", error);
    } finally {
      setIsPending(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      aria-label={isFavorite ? "Прибрати з обраного" : "Додати в обране"}
      title={isFavorite ? "Прибрати з обраного" : "Додати в обране"}
      className={`flex h-10 w-10 items-center justify-center rounded-full bg-white text-xl shadow transition hover:scale-105 disabled:cursor-wait disabled:opacity-70 ${className}`}
    >
      {isFavorite ? "❤️" : "🤍"}
    </button>
  );
}
