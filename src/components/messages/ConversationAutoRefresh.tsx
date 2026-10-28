"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function ConversationAutoRefresh() {
  const router = useRouter();

  useEffect(() => {
    const interval = window.setInterval(() => {
      const activeElement = document.activeElement;
      const isTyping =
        activeElement instanceof HTMLTextAreaElement ||
        activeElement instanceof HTMLInputElement;

      if (document.visibilityState === "visible" && !isTyping) {
        router.refresh();
      }
    }, 12_000);

    return () => window.clearInterval(interval);
  }, [router]);

  return null;
}
