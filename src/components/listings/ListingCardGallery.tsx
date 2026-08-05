"use client";

import Image from "next/image";
import { useState } from "react";

type Props = {
  images: string[];
  alt: string;
};

export function ListingCardGallery({ images, alt }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);

  const visibleImages = images.slice(0, 3);
  const hasMultipleImages = visibleImages.length > 1;

  function showPrevious(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();

    setActiveIndex((current) =>
      current === 0 ? visibleImages.length - 1 : current - 1,
    );
  }

  function showNext(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();

    setActiveIndex((current) =>
      current === visibleImages.length - 1 ? 0 : current + 1,
    );
  }

  if (visibleImages.length === 0) {
    return (
      <div className="flex h-full items-center justify-center bg-stone-100">
        <span className="text-stone-400">Без фото</span>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      <Image
        src={visibleImages[activeIndex]}
        alt={alt}
        fill
        className="object-cover transition group-hover:scale-105"
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 20vw"
      />

      {hasMultipleImages && (
        <>
          <button
            type="button"
            onClick={showPrevious}
            aria-label="Попереднє фото"
            className="absolute left-2 top-1/2 z-20 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-lg shadow"
          >
            ‹
          </button>

          <button
            type="button"
            onClick={showNext}
            aria-label="Наступне фото"
            className="absolute right-2 top-1/2 z-20 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-lg shadow"
          >
            ›
          </button>

          <span className="absolute bottom-2 right-2 rounded-full bg-black/65 px-2 py-1 text-xs text-white">
            {activeIndex + 1}/{visibleImages.length}
          </span>
        </>
      )}
    </div>
  );
}
