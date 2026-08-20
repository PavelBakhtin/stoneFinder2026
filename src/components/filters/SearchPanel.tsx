"use client";

import { FormEvent, useMemo, useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";

import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { cityOptions, materialOptions, sortOptions } from "@/lib/filters";

type Props = {
  initialQuery?: string;
  initialMaterial?: string;
  initialCity?: string;
  initialSort?: string;
  initialLengthFrom?: string;
  initialLengthTo?: string;
  initialWidthFrom?: string;
  initialWidthTo?: string;
  initialListingType?: string;
};

type SearchValues = {
  query: string;
  material: string;
  city: string;
  sort: string;
  lengthFrom: string;
  lengthTo: string;
  widthFrom: string;
  widthTo: string;
  listingType: string;
};

export function SearchPanel({
  initialQuery = "",
  initialMaterial = "",
  initialCity = "",
  initialSort = "new",
  initialLengthFrom = "",
  initialLengthTo = "",
  initialWidthFrom = "",
  initialWidthTo = "",
  initialListingType = "",
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const [query, setQuery] = useState(initialQuery);
  const [material, setMaterial] = useState(initialMaterial);
  const [city, setCity] = useState(initialCity);
  const [sort, setSort] = useState(initialSort);
  const [listingType, setListingType] = useState(initialListingType);
  const [lengthFrom, setLengthFrom] = useState(initialLengthFrom);
  const [lengthTo, setLengthTo] = useState(initialLengthTo);
  const [widthFrom, setWidthFrom] = useState(initialWidthFrom);
  const [widthTo, setWidthTo] = useState(initialWidthTo);

  const hasAdvancedFilters =
    Boolean(initialMaterial) ||
    Boolean(initialCity) ||
    initialSort !== "new" ||
    Boolean(initialLengthFrom) ||
    Boolean(initialLengthTo) ||
    Boolean(initialWidthFrom) ||
    Boolean(initialWidthTo);

  const [advancedOpen, setAdvancedOpen] = useState(hasAdvancedFilters);

  const values: SearchValues = {
    query,
    material,
    city,
    sort,
    lengthFrom,
    lengthTo,
    widthFrom,
    widthTo,
    listingType,
  };

  const activeAdvancedCount = useMemo(() => {
    let count = 0;

    if (material) count += 1;
    if (city) count += 1;
    if (sort !== "new") count += 1;
    if (lengthFrom || lengthTo || widthFrom || widthTo) count += 1;

    return count;
  }, [
    material,
    city,
    sort,
    lengthFrom,
    lengthTo,
    widthFrom,
    widthTo,
  ]);

  function buildUrl(nextValues: SearchValues) {
    const params = new URLSearchParams();

    setOrDelete(params, "q", nextValues.query.trim());
    setOrDelete(params, "material", nextValues.material);
    setOrDelete(params, "city", nextValues.city);
    setOrDelete(params, "lengthFrom", nextValues.lengthFrom);
    setOrDelete(params, "lengthTo", nextValues.lengthTo);
    setOrDelete(params, "widthFrom", nextValues.widthFrom);
    setOrDelete(params, "widthTo", nextValues.widthTo);
    setOrDelete(params, "listingType", nextValues.listingType);

    if (nextValues.sort !== "new") {
      params.set("sort", nextValues.sort);
    }

    const paramsString = params.toString();

    return paramsString ? `${pathname}?${paramsString}` : pathname;
  }

  function applySearch(nextValues: SearchValues = values) {
    startTransition(() => {
      router.push(buildUrl(nextValues), {
        scroll: false,
      });
    });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    applySearch();
  }

  function handleQueryChange(nextQuery: string) {
    setQuery(nextQuery);

    if (nextQuery === "") {
      applySearch({
        ...values,
        query: "",
      });
    }
  }

  function clearQuery() {
    setQuery("");

    applySearch({
      ...values,
      query: "",
    });
  }

  function changeListingType(nextListingType: string) {
    setListingType(nextListingType);

    applySearch({
      ...values,
      listingType: nextListingType,
    });
  }

  function changeMaterial(nextMaterial: string) {
    setMaterial(nextMaterial);

    applySearch({
      ...values,
      material: nextMaterial,
    });
  }

  function changeCity(nextCity: string) {
    setCity(nextCity);

    applySearch({
      ...values,
      city: nextCity,
    });
  }

  function changeSort(nextSort: string) {
    setSort(nextSort);

    applySearch({
      ...values,
      sort: nextSort,
    });
  }

  function clearAdvanced() {
    const nextValues: SearchValues = {
      ...values,
      material: "",
      city: "",
      sort: "new",
      lengthFrom: "",
      lengthTo: "",
      widthFrom: "",
      widthTo: "",
    };

    setMaterial("");
    setCity("");
    setSort("new");
    setLengthFrom("");
    setLengthTo("");
    setWidthFrom("");
    setWidthTo("");

    applySearch(nextValues);
  }

  return (
    <form
      onSubmit={handleSubmit}
      aria-busy={isPending}
      className="rounded-2xl border border-gray-200 bg-white p-3 shadow-sm sm:p-5"
    >
      <label htmlFor="listing-search" className="sr-only">
        Пошук за назвою
      </label>

      <div className="flex gap-2">
        <div className="relative min-w-0 flex-1">
          <input
            id="listing-search"
            type="text"
            value={query}
            onChange={(event) => handleQueryChange(event.target.value)}
            placeholder="Avant 7700, Imperador Dark..."
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 pr-11 text-base outline-none focus:border-black"
          />

          {query && (
            <button
              type="button"
              onClick={clearQuery}
              disabled={isPending}
              aria-label="Очистити пошуковий запит"
              title="Очистити пошуковий запит"
              className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 hover:text-black"
            >
              ✕
            </button>
          )}
        </div>

        <button
          type="submit"
          disabled={isPending}
          aria-label="Виконати пошук"
          className="flex h-[50px] w-[50px] shrink-0 items-center justify-center gap-2 rounded-xl bg-black text-lg text-white transition hover:bg-gray-800 disabled:cursor-wait disabled:opacity-60 sm:w-auto sm:px-6 sm:text-sm sm:font-medium"
        >
          {isPending ? (
            <LoadingSpinner className="h-5 w-5" />
          ) : (
            <span className="sm:hidden" aria-hidden="true">
              🔍
            </span>
          )}
          <span className="hidden sm:inline">
            {isPending ? "Шукаємо…" : "Пошук"}
          </span>
        </button>
      </div>

      <div className="mt-3 flex overflow-hidden rounded-xl border border-gray-300">
        <TypeButton
          active={listingType === ""}
          onClick={() => changeListingType("")}
          activeClass="bg-black text-white"
          disabled={isPending}
        >
          Всі
        </TypeButton>

        <TypeButton
          active={listingType === "OFFER"}
          onClick={() => changeListingType("OFFER")}
          activeClass="bg-green-600 text-white"
          withBorder
          disabled={isPending}
        >
          Пропоную
        </TypeButton>

        <TypeButton
          active={listingType === "WANTED"}
          onClick={() => changeListingType("WANTED")}
          activeClass="bg-orange-500 text-white"
          withBorder
          disabled={isPending}
        >
          Шукаю
        </TypeButton>
      </div>

      <button
        type="button"
        onClick={() => setAdvancedOpen((current) => !current)}
        className="mt-3 flex w-full items-center justify-between px-1 py-1 text-sm font-medium text-gray-600 transition hover:text-black"
        aria-expanded={advancedOpen}
      >
        <span>
          ⚙ Розширений пошук
          {activeAdvancedCount > 0 && (
            <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
              {activeAdvancedCount}
            </span>
          )}
        </span>

        <span aria-hidden="true">{advancedOpen ? "▲" : "▼"}</span>
      </button>

      {advancedOpen && (
        <div className="mt-3 border-t border-gray-200 pt-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <select
              value={material}
              onChange={(event) => changeMaterial(event.target.value)}
              aria-label="Тип матеріалу"
              disabled={isPending}
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 disabled:cursor-wait disabled:opacity-60"
            >
              <option value="">Усі матеріали</option>

              {materialOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <select
              value={city}
              onChange={(event) => changeCity(event.target.value)}
              aria-label="Місто"
              disabled={isPending}
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 disabled:cursor-wait disabled:opacity-60"
            >
              <option value="">Україна</option>

              {cityOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <select
              value={sort}
              onChange={(event) => changeSort(event.target.value)}
              aria-label="Сортування"
              disabled={isPending}
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 disabled:cursor-wait disabled:opacity-60"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-4">
            <p className="mb-2 text-sm font-semibold">Розміри, мм</p>

            <div className="space-y-3 rounded-xl bg-stone-50 p-3 sm:p-4">
              <DimensionRow
                label="Довжина"
                fromValue={lengthFrom}
                toValue={lengthTo}
                onFromChange={setLengthFrom}
                onToChange={setLengthTo}
              />

              <DimensionRow
                label="Ширина"
                fromValue={widthFrom}
                toValue={widthTo}
                onFromChange={setWidthFrom}
                onToChange={setWidthTo}
              />
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between gap-3">
            {activeAdvancedCount > 0 ? (
              <button
                type="button"
                onClick={clearAdvanced}
                disabled={isPending}
                className="text-sm font-medium text-gray-500 transition hover:text-black disabled:cursor-wait disabled:opacity-60"
              >
                Скинути фільтри
              </button>
            ) : (
              <span />
            )}

            <button
              type="submit"
              disabled={isPending}
              className="flex items-center justify-center gap-2 rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-wait disabled:opacity-60"
            >
              {isPending && <LoadingSpinner className="h-4 w-4" />}
              <span>{isPending ? "Застосовуємо…" : "Застосувати"}</span>
            </button>
          </div>
        </div>
      )}
    </form>
  );
}

type TypeButtonProps = {
  active: boolean;
  onClick: () => void;
  activeClass: string;
  withBorder?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
};

function TypeButton({
  active,
  onClick,
  activeClass,
  withBorder = false,
  disabled = false,
  children,
}: TypeButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex-1 px-3 py-2.5 text-sm font-medium transition disabled:cursor-wait disabled:opacity-60 ${
        withBorder ? "border-l border-gray-300" : ""
      } ${active ? activeClass : "bg-white hover:bg-gray-100"}`}
    >
      {children}
    </button>
  );
}

type DimensionRowProps = {
  label: string;
  fromValue: string;
  toValue: string;
  onFromChange: (value: string) => void;
  onToChange: (value: string) => void;
};

function DimensionRow({
  label,
  fromValue,
  toValue,
  onFromChange,
  onToChange,
}: DimensionRowProps) {
  return (
    <div className="grid gap-2 sm:grid-cols-[100px_1fr_auto_1fr] sm:items-center sm:gap-3">
      <span className="text-sm font-medium sm:text-base">{label}</span>

      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:contents">
        <input
          type="number"
          min="0"
          inputMode="numeric"
          value={fromValue}
          onChange={(event) => onFromChange(event.target.value)}
          placeholder="Від"
          aria-label={`${label}: мінімум`}
          className="min-w-0 rounded-xl border border-gray-300 bg-white px-3 py-3 outline-none focus:border-black"
        />

        <span className="text-gray-400">—</span>

        <input
          type="number"
          min="0"
          inputMode="numeric"
          value={toValue}
          onChange={(event) => onToChange(event.target.value)}
          placeholder="До"
          aria-label={`${label}: максимум`}
          className="min-w-0 rounded-xl border border-gray-300 bg-white px-3 py-3 outline-none focus:border-black"
        />
      </div>
    </div>
  );
}

function setOrDelete(params: URLSearchParams, name: string, value: string) {
  if (value) {
    params.set(name, value);
  } else {
    params.delete(name);
  }
}
