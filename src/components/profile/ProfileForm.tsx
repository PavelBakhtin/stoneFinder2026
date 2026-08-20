"use client";

import { FormEvent, useEffect, useRef, useState } from "react";

import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { cities } from "@/lib/cities";

type Props = {
  initialDisplayName: string;
  initialPhone: string;
  initialCity: string;
};

const CUSTOM_CITY_VALUE = "__CUSTOM_CITY__";
const profileCities = cities.filter((city) => city !== "Вся Україна");

function getInitialCityState(initialCity: string) {
  if (!initialCity) {
    return {
      selectedCity: "",
      customCity: "",
    };
  }

  if (profileCities.includes(initialCity as (typeof profileCities)[number])) {
    return {
      selectedCity: initialCity,
      customCity: "",
    };
  }

  return {
    selectedCity: CUSTOM_CITY_VALUE,
    customCity: initialCity,
  };
}

export function ProfileForm({
  initialDisplayName,
  initialPhone,
  initialCity,
}: Props) {
  const initialCityState = getInitialCityState(initialCity);

  const [displayName, setDisplayName] = useState(initialDisplayName);
  const [phone, setPhone] = useState(initialPhone);
  const [selectedCity, setSelectedCity] = useState(
    initialCityState.selectedCity,
  );
  const [customCity, setCustomCity] = useState(initialCityState.customCity);
  const [formMessage, setFormMessage] = useState("");
  const [formError, setFormError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const successTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (successTimerRef.current) {
        clearTimeout(successTimerRef.current);
      }
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedDisplayName = displayName.trim();
    const city =
      selectedCity === CUSTOM_CITY_VALUE
        ? customCity.trim()
        : selectedCity.trim();

    setFormMessage("");
    setFormError("");

    if (!normalizedDisplayName) {
      setFormError("Вкажіть ім’я або назву майстерні");
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          displayName: normalizedDisplayName,
          phone,
          city,
        }),
      });

      const result = (await response.json()) as {
        error?: string;
      };

      if (!response.ok) {
        setFormError(result.error ?? "Не вдалося зберегти профіль");
        return;
      }

      setDisplayName(normalizedDisplayName);
      setPhone(phone.trim());
      setCustomCity(customCity.trim());
      setFormMessage("Профіль успішно збережено");

      if (successTimerRef.current) {
        clearTimeout(successTimerRef.current);
      }

      successTimerRef.current = setTimeout(() => {
        setFormMessage("");
      }, 3000);
    } catch {
      setFormError("Не вдалося зберегти профіль");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {formError && (
        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {formError}
        </p>
      )}

      {formMessage && (
        <p className="rounded-lg bg-green-50 p-3 text-sm text-green-700">
          ✓ {formMessage}
        </p>
      )}

      <label className="block space-y-1.5">
        <span className="text-sm font-medium">
          Ім’я або назва майстерні
          <span className="ml-1 text-red-600" aria-hidden="true">
            *
          </span>
        </span>

        <input
          type="text"
          required
          maxLength={80}
          autoComplete="name"
          value={displayName}
          onChange={(event) => setDisplayName(event.target.value)}
          placeholder="Наприклад, Олександр або Мірана"
          className="w-full rounded-lg border bg-white p-3"
        />

        <span className="block text-xs text-gray-500">
          Так вас бачитимуть інші користувачі.
        </span>
      </label>

      <label className="block space-y-1.5">
        <span className="text-sm font-medium">Основний телефон</span>

        <input
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          maxLength={50}
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          placeholder="+380..."
          className="w-full rounded-lg border bg-white p-3"
        />

        <span className="block text-xs text-gray-500">
          Автоматично підставлятиметься в нові оголошення.
        </span>
      </label>

      <div className="space-y-2">
        <label className="block space-y-1.5">
          <span className="text-sm font-medium">Місто</span>

          <select
            value={selectedCity}
            onChange={(event) => {
              setSelectedCity(event.target.value);

              if (event.target.value !== CUSTOM_CITY_VALUE) {
                setCustomCity("");
              }
            }}
            className="w-full rounded-lg border bg-white p-3"
          >
            <option value="">Не вказано</option>

            {profileCities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}

            <option value={CUSTOM_CITY_VALUE}>Інший населений пункт…</option>
          </select>
        </label>

        {selectedCity === CUSTOM_CITY_VALUE && (
          <label className="block space-y-1.5">
            <span className="text-sm font-medium">
              Назва населеного пункту
            </span>

            <input
              type="text"
              maxLength={100}
              value={customCity}
              onChange={(event) => setCustomCity(event.target.value)}
              placeholder="Введіть назву"
              className="w-full rounded-lg border bg-white p-3"
            />
          </label>
        )}

        <p className="text-xs text-gray-500">
          Так буде простіше оцінити відстань до ваших оголошень.
        </p>
      </div>

      <button
        type="submit"
        disabled={isSaving}
        className="w-full rounded-lg bg-black px-6 py-3 font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
      >
        <span className="flex items-center justify-center gap-2">
          {isSaving && <LoadingSpinner className="h-4 w-4" />}
          <span>{isSaving ? "Зберігаємо…" : "Зберегти профіль"}</span>
        </span>
      </button>
    </form>
  );
}
