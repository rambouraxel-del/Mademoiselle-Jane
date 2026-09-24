"use client";

import { useState } from "react";
import { MedalPlaceholder } from "@/components/ui/MedalPlaceholder";
import type { ProductShape } from "@/types";

export function ProductGallery({
  shape,
  colors,
  captions,
}: {
  shape: ProductShape;
  colors: string[];
  captions: string[];
}) {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className="flex flex-col gap-4">
      <MedalPlaceholder
        shape={shape}
        colors={colors}
        seed={activeIndex}
        caption={captions[activeIndex]}
        className="aspect-square w-full"
      />
      <div className="flex gap-3">
        {captions.map((caption, index) => (
          <button
            key={caption}
            type="button"
            onClick={() => setActiveIndex(index)}
            aria-label={`Voir : ${caption}`}
            aria-pressed={activeIndex === index}
            className={`h-20 w-20 shrink-0 overflow-hidden rounded-2xl border-2 transition-colors ${
              activeIndex === index ? "border-clay" : "border-transparent"
            }`}
          >
            <MedalPlaceholder shape={shape} colors={colors} seed={index} className="h-full w-full" />
          </button>
        ))}
      </div>
    </div>
  );
}
