"use client";

import { FormEvent, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

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
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(initialQuery);
  const [material, setMaterial] = useState(initialMaterial);
  const [city, setCity] = useState(initialCity);
  const [sort, setSort] = useState(initialSort);

  const [lengthFrom, setLengthFrom] = useState(initialLengthFrom);
  const [lengthTo, setLengthTo] = useState(initialLengthTo);
  const [widthFrom, setWidthFrom] = useState(initialWidthFrom);
  const [widthTo, setWidthTo] = useState(initialWidthTo);

  const hasInitialDimensions =
    Boolean(initialLengthFrom) ||
    Boolean(initialLengthTo) ||
    Boolean(initialWidthFrom) ||
    Boolean(initialWidthTo);

  const [mobileDimensionsOpen, setMobileDimensionsOpen] =
    useState(hasInitialDimensions);

  const values: SearchValues = {
    query,
    material,
    city,
    sort,
    lengthFrom,
    lengthTo,
    widthFrom,
    widthTo,
  };

  function buildUrl(nextValues: SearchValues) {
    const params = new URLSearchParams();

    setOrDelete(params, "q", nextValues.query.trim());
    setOrDelete(params, "material", nextValues.material);
    setOrDelete(params, "city", nextValues.city);
    setOrDelete(params, "lengthFrom", nextValues.lengthFrom);
    setOrDelete(params, "lengthTo", nextValues.lengthTo);
    setOrDelete(params, "widthFrom", nextValues.widthFrom);
    setOrDelete(params, "widthTo", nextValues.widthTo);

    if (nextValues.sort !== "new") {
      params.set("sort", nextValues.sort);
    }

    const paramsString = params.toString();

    return paramsString ? `${pathname}?${paramsString}` : pathname;
  }

  function applySearch(nextValues: SearchValues = values) {
    router.push(buildUrl(nextValues), {
      scroll: false,
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

  function clearAll() {
    setQuery("");
    setMaterial("");
    setCity("");
    setSort("new");
    setLengthFrom("");
    setLengthTo("");
    setWidthFrom("");
    setWidthTo("");
    setMobileDimensionsOpen(false);

    router.push(pathname, {
      scroll: false,
    });
  }

  const hasDimensions =
    Boolean(lengthFrom) ||
    Boolean(lengthTo) ||
    Boolean(widthFrom) ||
    Boolean(widthTo);

  const hasFilters =
    Boolean(query) ||
    Boolean(material) ||
    Boolean(city) ||
    sort !== "new" ||
    hasDimensions ||
    searchParams.toString() !== "";

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6"
    >
      <label
        htmlFor="listing-search"
        className="mb-2 block text-sm font-semibold"
      >
        Пошук за назвою
      </label>

      <div className="flex gap-2 sm:gap-3">
        <div className="relative min-w-0 flex-1">
          <input
            id="listing-search"
            type="text"
            value={query}
            onChange={(event) => handleQueryChange(event.target.value)}
            placeholder="Avant 7700, Imperador Dark..."
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-4 pr-12 outline-none focus:border-black"
          />

          {query && (
            <button
              type="button"
              onClick={clearQuery}
              aria-label="Очистити пошуковий запит"
              title="Очистити пошуковий запит"
              className="absolute top-1/2 right-3 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-lg text-gray-500 hover:bg-gray-100 hover:text-black"
            >
              ✕
            </button>
          )}
        </div>

        <button
          type="submit"
          aria-label="Виконати пошук"
          className="flex min-h-14 shrink-0 items-center justify-center rounded-xl bg-black px-5 font-medium text-white hover:bg-gray-800 sm:px-7"
        >
          <span className="sm:hidden" aria-hidden="true">
            🔍
          </span>

          <span className="hidden sm:inline">Пошук</span>
        </button>
      </div>

      <button
        type="button"
        onClick={() => setMobileDimensionsOpen((current) => !current)}
        className="mt-5 flex w-full items-center justify-between rounded-xl border border-gray-200 px-4 py-3 text-left font-medium sm:hidden"
        aria-expanded={mobileDimensionsOpen}
      >
        <span>
          📐 Розміри
          {hasDimensions && (
            <span className="ml-2 text-sm text-gray-500">активні</span>
          )}
        </span>

        <span className="text-xl">{mobileDimensionsOpen ? "−" : "+"}</span>
      </button>

      <div
        className={`mt-4 ${mobileDimensionsOpen ? "block" : "hidden"} sm:block`}
      >
        <p className="mb-3 hidden text-sm font-semibold sm:block">
          Розміри, мм
        </p>

        <div className="space-y-3 rounded-xl bg-stone-50 p-4">
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

      <div className="mt-5 flex flex-wrap gap-3">
        <select
          value={material}
          onChange={(event) => changeMaterial(event.target.value)}
          aria-label="Тип матеріалу"
          className="min-w-0 rounded-xl border border-gray-300 bg-white px-4 py-3"
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
          className="min-w-0 rounded-xl border border-gray-300 bg-white px-4 py-3"
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
          className="min-w-0 rounded-xl border border-gray-300 bg-white px-4 py-3"
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {hasFilters && (
          <button
            type="button"
            onClick={clearAll}
            className="rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-medium hover:bg-gray-100"
            title="Скинути всі фільтри"
          >
            <span className="sm:hidden">✕</span>
            <span className="hidden sm:inline">Скинути</span>
          </button>
        )}
      </div>
    </form>
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
      <span className="font-medium">{label}</span>

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
