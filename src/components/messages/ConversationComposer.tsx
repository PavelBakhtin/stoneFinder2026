"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { sendMessageAction } from "@/app/messages/actions";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

function SendButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-black px-5 py-3 font-semibold text-white transition hover:bg-gray-800 disabled:cursor-wait disabled:opacity-60"
    >
      {pending && <LoadingSpinner className="h-4 w-4" />}
      <span>{pending ? "Надсилаємо…" : "Надіслати"}</span>
    </button>
  );
}

export function ConversationComposer({
  conversationId,
}: {
  conversationId: string;
}) {
  const [state, formAction] = useActionState(sendMessageAction, {
    error: null,
  });

  return (
    <form action={formAction} className="border-t bg-white pt-4">
      <input type="hidden" name="conversation_id" value={conversationId} />

      <div className="flex items-end gap-2">
        <label htmlFor="message-body" className="sr-only">
          Повідомлення
        </label>

        <textarea
          id="message-body"
          name="body"
          required
          maxLength={2000}
          rows={2}
          placeholder="Напиши повідомлення…"
          className="min-h-[50px] flex-1 resize-y rounded-xl border p-3 outline-none transition focus:border-gray-500"
        />

        <SendButton />
      </div>

      {state.error && (
        <p className="mt-2 text-sm text-red-700">{state.error}</p>
      )}
    </form>
  );
}
