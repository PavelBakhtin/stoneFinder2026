import Link from "next/link";

export default function ListingNotFound() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 items-center px-4 py-12 sm:px-6 sm:py-20">
      <section className="w-full rounded-2xl border border-gray-200 bg-white px-6 py-10 text-center shadow-sm sm:px-10 sm:py-14">
        <div
          aria-hidden="true"
          className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-stone-100 text-2xl"
        >
          🪨
        </div>

        <h1 className="mt-5 text-2xl font-bold sm:text-3xl">
          Оголошення більше недоступне
        </h1>

        <p className="mx-auto mt-3 max-w-md leading-6 text-gray-600">
          На жаль, це оголошення було видалено або посилання більше не
          актуальне.
        </p>

        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/"
            className="rounded-xl bg-black px-6 py-3 font-semibold text-white transition hover:bg-gray-800"
          >
            Перейти до оголошень
          </Link>

          <Link
            href="/add"
            className="rounded-xl border border-gray-300 px-6 py-3 font-semibold transition hover:bg-gray-50"
          >
            + Додати оголошення
          </Link>
        </div>
      </section>
    </main>
  );
}
