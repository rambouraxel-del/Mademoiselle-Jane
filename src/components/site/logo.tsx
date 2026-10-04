import Image from "next/image";
import type { MediaRef } from "@/lib/catalog/types";

/**
 * Logo manuscrit « Mademoizelle Jane ».
 * Par défaut : tracé vectoriel fidèle au lettrage des maquettes
 * (public/logo-mademoizelle-jane.svg, fond transparent).
 * Un logo de remplacement peut être choisi dans l'administration.
 */
export const LOGO_RATIO = 3800 / 930;

export function Logo({
  custom,
  alt,
  className = "",
  priority,
}: {
  custom?: MediaRef | null;
  alt: string;
  className?: string;
  priority?: boolean;
}) {
  if (custom) {
    return (
      <Image
        src={custom.url}
        alt={alt}
        width={custom.width}
        height={custom.height}
        priority={priority}
        className={`h-auto w-full object-contain ${className}`}
        sizes="(min-width: 1024px) 380px, 260px"
      />
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element -- SVG vectoriel servi tel quel
    <img
      src="/logo-mademoizelle-jane.svg"
      alt={alt}
      width={380}
      height={93}
      className={`h-auto w-full ${className}`}
      decoding="async"
    />
  );
}
