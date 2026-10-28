"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";

import { startConversationAction } from "@/app/messages/actions";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

type Props = {
  listingId: string;
  isAuthenticated: boolean;
};

function SendButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center justify-center gap-2 rounded-lg bg-black px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-wait disabled:opacity-60"
    >
      {pending && <LoadingSpinner className="h-4 w-4" />}
      <span>{pending ? "Надсилаємо…" : "Надіслати"}</span>
    </button>
  );
}

function Composer({ listingId, onCancel }: { listingId: string; onCancel: () => void }) {
  const [state, formAction] = useActionState(startConversationAction, {
    error: null,
  });

  return (
    <form action={formAction} className="rounded-xl border bg-stone-50 p-3">
      <input type="hidden" name="listing_id" value={listingId} />

      <label htmlFor={`message-${listingId}`} className="sr-only">
        Повідомлення автору
      </label>

      <textarea
        id={`message-${listingId}`}
        name="body"
        required
        maxLength={2000}
        rows={3}
        autoFocus
        placeholder="Напиши повідомлення автору оголошення…"
        className="w-full resize-y rounded-lg border bg-white p-3 text-sm outline-none transition focus:border-gray-500"
      />

      {state.error && (
        <p className="mt-2 text-sm text-red-700">{state.error}</p>
      )}

      <div className="mt-3 flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border bg-white px-4 py-2.5 text-sm font-medium transition hover:bg-gray-50"
        >
          Скасувати
        </button>

        <SendButton />
      </div>
    </form>
  );
}

export function MessageListingButton({ listingId, isAuthenticated }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  if (!isAuthenticated) {
    return (
      <Link
        href={`/login?next=/listing/${listingId}`}
        className="block rounded-xl border px-4 py-3 text-center font-medium transition hover:bg-gray-50"
      >
        Написати
      </Link>
    );
  }

  if (isOpen) {
    return <Composer listingId={listingId} onCancel={() => setIsOpen(false)} />;
  }

  return (
    <button
      type="button"
      onClick={() => setIsOpen(true)}
      className="block w-full rounded-xl border px-4 py-3 text-center font-medium transition hover:bg-gray-50"
    >
      Написати
    </button>
  );
}
