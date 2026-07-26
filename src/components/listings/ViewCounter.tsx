"use client";

import { useEffect } from "react";

type Props = {
  listingId: string;
  initialViews: number;
};

export function ViewCounter({ listingId, initialViews }: Props) {
  useEffect(() => {
    const storageKey = `stonefinder-viewed-${listingId}`;

    if (sessionStorage.getItem(storageKey)) {
      return;
    }

    sessionStorage.setItem(storageKey, "true");

    void fetch(`/api/listings/${listingId}/view`, {
      method: "POST",
    });
  }, [listingId]);

  return (
    <p className="text-sm text-gray-500">
      👁️ {initialViews.toLocaleString("uk-UA")} переглядів
    </p>
  );
}
