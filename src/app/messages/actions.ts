"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

type ActionState = {
  error: string | null;
};

function normalizeMessage(formData: FormData) {
  return String(formData.get("body") ?? "").trim();
}

function validateMessage(body: string) {
  if (!body) {
    return "Напиши повідомлення.";
  }

  if (body.length > 2000) {
    return "Повідомлення може містити максимум 2000 символів.";
  }

  return null;
}

export async function startConversationAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const listingId = String(formData.get("listing_id") ?? "").trim();
  const body = normalizeMessage(formData);

  if (!listingId) {
    return { error: "Оголошення не знайдено." };
  }

  const validationError = validateMessage(body);

  if (validationError) {
    return { error: validationError };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=/listing/${listingId}`);
  }

  const { data: conversationId, error } = await supabase.rpc(
    "start_conversation",
    {
      p_listing_id: listingId,
      p_body: body,
    },
  );

  if (error || !conversationId) {
    console.error("Не вдалося почати діалог", error);
    return {
      error:
        error?.message === "Cannot start a conversation with yourself"
          ? "Не можна написати самому собі."
          : "Не вдалося надіслати повідомлення. Спробуй ще раз.",
    };
  }

  revalidatePath("/messages");
  redirect(`/messages/${conversationId}`);
}

export async function sendMessageAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const conversationId = String(
    formData.get("conversation_id") ?? "",
  ).trim();
  const body = normalizeMessage(formData);

  if (!conversationId) {
    return { error: "Діалог не знайдено." };
  }

  const validationError = validateMessage(body);

  if (validationError) {
    return { error: validationError };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=/messages/${conversationId}`);
  }

  const { error } = await supabase.rpc("send_message", {
    p_conversation_id: conversationId,
    p_body: body,
  });

  if (error) {
    console.error("Не вдалося надіслати повідомлення", error);
    return {
      error: "Не вдалося надіслати повідомлення. Спробуй ще раз.",
    };
  }

  revalidatePath("/messages");
  revalidatePath(`/messages/${conversationId}`);
  redirect(`/messages/${conversationId}`);
}
