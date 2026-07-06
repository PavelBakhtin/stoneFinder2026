"use client";

import { useRouter, useSearchParams } from "next/navigation";

export function ClearFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const hasFilters =
    searchParams.has("q") ||
    searchParams.has("material") ||
    searchParams.has("city") ||
    searchParams.has("sort");

  if (!hasFilters) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={() => router.push("/")}
      className="flex h-11 w-11 items-center justify-center rounded-lg border border-grey-300 bg-white text-lg hover:bg-red-100"
      title="Очистити фільтри"
    >
      ✕
    </button>
  );
}
