"use client";

import { useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

export function ClearFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

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
      onClick={() => startTransition(() => router.push("/"))}
      disabled={isPending}
      className="flex h-11 w-11 items-center justify-center rounded-lg border border-grey-300 bg-white text-lg hover:bg-red-100 disabled:cursor-wait disabled:opacity-60"
      title="Очистити фільтри"
    >
      {isPending ? <LoadingSpinner className="h-5 w-5" /> : "✕"}
    </button>
  );
}
