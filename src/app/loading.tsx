import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

export default function Loading() {
  return (
    <main className="mx-auto flex min-h-[45vh] max-w-7xl items-center justify-center px-4 py-12">
      <div
        className="flex items-center gap-3 rounded-xl border bg-white px-5 py-4 text-sm font-medium text-gray-700 shadow-sm"
        role="status"
        aria-live="polite"
      >
        <LoadingSpinner className="h-5 w-5" />
        Завантаження…
      </div>
    </main>
  );
}
