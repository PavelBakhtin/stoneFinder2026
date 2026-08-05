"use client";

import Image from "next/image";
import { useState } from "react";

type Props = {
  images: string[];
  alt: string;
};

export function ListingGallery({ images, alt }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (images.length === 0) {
    return null;
  }

  const hasMultipleImages = images.length > 1;

  function showPrevious() {
    setActiveIndex((current) =>
      current === 0 ? images.length - 1 : current - 1,
    );
  }

  function showNext() {
    setActiveIndex((current) =>
      current === images.length - 1 ? 0 : current + 1,
    );
  }

  return (
    <div className="mb-6 space-y-3">
      <div className="relative h-80 w-full overflow-hidden rounded-xl bg-gray-200">
        <Image
          src={images[activeIndex]}
          alt={`${alt}, фото ${activeIndex + 1}`}
          fill
          priority={activeIndex === 0}
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 768px"
        />

        {hasMultipleImages && (
          <>
            <button
              type="button"
              onClick={showPrevious}
              aria-label="Попереднє фото"
              className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-2xl shadow"
            >
              ‹
            </button>

            <button
              type="button"
              onClick={showNext}
              aria-label="Наступне фото"
              className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-2xl shadow"
            >
              ›
            </button>

            <span className="absolute bottom-3 right-3 rounded-full bg-black/65 px-3 py-1 text-sm text-white">
              {activeIndex + 1}/{images.length}
            </span>
          </>
        )}
      </div>

      {hasMultipleImages && (
        <div className="grid grid-cols-3 gap-3">
          {images.map((image, index) => (
            <button
              key={image}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`relative aspect-[4/3] overflow-hidden rounded-lg border-2 ${
                activeIndex === index ? "border-black" : "border-transparent"
              }`}
            >
              <Image
                src={image}
                alt={`${alt}, мініатюра ${index + 1}`}
                fill
                className="object-cover"
                sizes="200px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
