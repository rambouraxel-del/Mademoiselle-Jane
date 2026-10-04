import Image from "next/image";
import type { MediaRef } from "@/lib/catalog/types";

type Props = {
  media: MediaRef | null | undefined;
  alt?: string;
  sizes: string;
  className?: string;
  priority?: boolean;
  quality?: number;
};

/**
 * Photo issue de la médiathèque : remplit son conteneur (qui fixe le ratio)
 * sans déformation, en respectant le point de cadrage choisi dans l'administration.
 */
export function MediaImage({ media, alt, sizes, className = "", priority, quality = 85 }: Props) {
  if (!media) {
    return <div className={`absolute inset-0 bg-beige ${className}`} aria-hidden="true" />;
  }
  return (
    <Image
      src={media.url}
      alt={alt ?? media.alt}
      fill
      sizes={sizes}
      priority={priority}
      quality={quality}
      className={`object-cover ${className}`}
      style={{ objectPosition: `${media.focalX}% ${media.focalY}%` }}
    />
  );
}
