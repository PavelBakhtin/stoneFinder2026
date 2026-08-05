"use client";

import Image from "next/image";
import { ChangeEvent, useRef, useState } from "react";
import { uploadListingImages } from "@/lib/uploadListingImages";

type Props = {
  initialImages?: string[];
  maxImages?: number;
  onChange: (urls: string[]) => void;
};

export function PhotoUploader({
  initialImages = [],
  maxImages = 3,
  onChange,
}: Props) {
  const [imageUrls, setImageUrls] = useState(initialImages);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleFiles(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);

    if (files.length === 0) {
      return;
    }

    if (files.length > maxImages) {
      setError(`Максимум ${maxImages} фото`);
      return;
    }

    setError("");
    setIsUploading(true);

    try {
      const currentCount = imageUrls.length;

      if (currentCount + files.length > maxImages) {
        throw new Error(`Максимум ${maxImages} фотографії`);
      }

      const uploadedUrls = await uploadListingImages(files);

      const updatedUrls = [...imageUrls, ...uploadedUrls];

      setImageUrls(updatedUrls);
      onChange(updatedUrls);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Помилка завантаження");
    } finally {
      setIsUploading(false);

      event.target.value = "";
    }
  }

  function removeImage(index: number) {
    const updated = imageUrls.filter((_, i) => i !== index);

    setImageUrls(updated);
    onChange(updated);
  }
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div className="space-y-4">
      <label className="block">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          disabled={isUploading}
          onChange={handleFiles}
        />

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isUploading}
          className="w-full rounded-xl border-2 border-dashed border-gray-300 p-6 text-center transition hover:border-black hover:bg-gray-50 disabled:opacity-50"
        >
          {isUploading
            ? "Завантаження..."
            : imageUrls.length === 0
              ? "🖼 Додати фотографії"
              : "🖼 Додати ще фотографії"}
        </button>

        <p className="text-sm text-gray-500">
          {imageUrls.length} / {maxImages} фотографій
        </p>
      </label>

      <p className="text-sm text-gray-500">До {maxImages} фотографій</p>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {imageUrls.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {imageUrls.map((url, index) => (
            <div
              key={url}
              className="relative aspect-square overflow-hidden rounded-lg border"
            >
              <Image
                src={url}
                alt={`Фото ${index + 1}`}
                fill
                sizes="200px"
                className="object-cover"
              />

              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute right-2 top-2 rounded-full bg-white/90 px-2 py-1 text-xs shadow"
              >
                ✕
              </button>

              {index === 0 && (
                <div className="absolute bottom-2 left-2 rounded bg-black/70 px-2 py-1 text-xs text-white">
                  Головне
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
