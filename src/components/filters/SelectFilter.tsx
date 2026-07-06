"use client";

import { useRouter, useSearchParams } from "next/navigation";

type Option = {
  label: string;
  value: string;
};

type Props = {
  name: string;
  options: Option[];
  allowEmpty?: boolean;
  emptyLabel?: string;
};

export function SelectFilter({
  name,
  options,
  allowEmpty = false,
  emptyLabel = "Усі",
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentValue =
    searchParams.get(name) ?? (allowEmpty ? "" : (options[0]?.value ?? ""));

  function handleChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());

    if (value) {
      params.set(name, value);
    } else {
      params.delete(name);
    }

    router.push(`/?${params.toString()}`);
  }

  return (
    <select
      value={currentValue}
      onChange={(event) => handleChange(event.target.value)}
      className="rounded-lg border border-gray-300 bg-white px-3 py-3"
    >
      {allowEmpty && <option value="">{emptyLabel}</option>}

      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
