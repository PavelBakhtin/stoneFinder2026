import Link from "next/link";

export default function ConversationNotFound() {
  return (
    <main className="mx-auto max-w-lg px-4 py-16 text-center sm:px-6">
      <h1 className="text-3xl font-bold">Діалог недоступний</h1>
      <p className="mt-3 text-gray-600">
        Цього діалогу не існує або ти не маєш до нього доступу.
      </p>
      <Link
        href="/messages"
        className="mt-6 inline-flex rounded-lg bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
      >
        До повідомлень
      </Link>
    </main>
  );
}
