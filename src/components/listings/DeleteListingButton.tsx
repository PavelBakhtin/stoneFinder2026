"use client";

import { deleteListing } from "@/app/actions";

type Props = {
  listingId: string;
};

export function DeleteListingButton({ listingId }: Props) {
  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.stopPropagation();

    if (!window.confirm("Видалити оголошення?")) {
      event.preventDefault();
    }
  }

  return (
    <form action={deleteListing.bind(null, listingId)} onSubmit={handleSubmit}>
      <button
        type="submit"
        title="Видалити"
        aria-label="Видалити оголошення"
        className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow transition hover:bg-red-50"
      >
        🗑️
      </button>
    </form>
  );
}
