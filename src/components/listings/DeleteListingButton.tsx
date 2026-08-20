"use client";

import { useFormStatus } from "react-dom";

import { deleteListing } from "@/app/actions";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

type Props = {
  listingId: string;
  variant?: "icon" | "full";
};

function DeleteSubmitButton({ variant }: { variant: "icon" | "full" }) {
  const { pending } = useFormStatus();

  if (variant === "full") {
    return (
      <button
        type="submit"
        disabled={pending}
        aria-disabled={pending}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-300 px-4 py-3 font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-wait disabled:opacity-60"
      >
        {pending && <LoadingSpinner className="h-4 w-4" />}
        <span>{pending ? "Видаляємо…" : "Видалити оголошення"}</span>
      </button>
    );
  }

  return (
    <button
      type="submit"
      disabled={pending}
      title={pending ? "Видаляємо…" : "Видалити"}
      aria-label={pending ? "Видаляємо оголошення" : "Видалити оголошення"}
      className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow transition hover:bg-red-50 disabled:cursor-wait disabled:opacity-70"
    >
      {pending ? <LoadingSpinner className="h-5 w-5 text-red-600" /> : "🗑️"}
    </button>
  );
}

export function DeleteListingButton({
  listingId,
  variant = "icon",
}: Props) {
  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.stopPropagation();

    if (!window.confirm("Видалити оголошення?")) {
      event.preventDefault();
    }
  }

  return (
    <form action={deleteListing.bind(null, listingId)} onSubmit={handleSubmit}>
      <DeleteSubmitButton variant={variant} />
    </form>
  );
}
