"use client";

import { useState } from "react";

export function ShareButton() {
  const [message, setMessage] = useState("");

  async function handleShare() {
    setMessage("Обробляю...");

    const url = window.location.href;

    try {
      if (typeof navigator.share === "function") {
        await navigator.share({
          title: document.title || "StoneFinder",
          text: "Оголошення на StoneFinder",
          url,
        });

        setMessage("Готово");
        return;
      }

      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
        setMessage("Посилання скопійовано");
        return;
      }

      const textarea = document.createElement("textarea");

      textarea.value = url;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";

      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();

      const copied = document.execCommand("copy");

      document.body.removeChild(textarea);

      setMessage(
        copied ? "Посилання скопійовано" : "Не вдалося скопіювати посилання",
      );
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        setMessage("Поширення скасовано");
      } else {
        setMessage("Не вдалося поділитися");
        console.error("Share error:", error);
      }
    }

    window.setTimeout(() => {
      setMessage("");
    }, 3000);
  }

  return (
    <div className="mt-4">
      <button
        type="button"
        onClick={handleShare}
        className="w-full rounded-lg border border-gray-300 py-3 font-medium transition hover:bg-gray-50"
      >
        🔗 Поділитися
      </button>

      {message && (
        <p className="mt-2 text-center text-sm text-gray-600">{message}</p>
      )}
    </div>
  );
}
