import { getColorHex } from "@/data/colorSwatches";
import { cn } from "@/utils/cn";
import type { ProductShape } from "@/types";

/**
 * Visuel de médaille généré en SVG, utilisé en attendant de vraies photos
 * produit. Piloté par les données (forme + couleurs) : il suffit de
 * remplacer ce composant par une balise <Image> lorsque les photos
 * artisanales seront disponibles.
 */

const shapePaths: Record<ProductShape, string> = {
  ronde: "M100,20 a80,80 0 1,0 0.1,0 Z",
  coeur:
    "M100,175 C40,130 10,90 10,58 C10,28 34,8 60,8 C80,8 96,20 100,38 C104,20 120,8 140,8 C166,8 190,28 190,58 C190,90 160,130 100,175 Z",
  os: "M35,80 a20,20 0 1,1 40,-10 a20,20 0 1,1 40,10 l10,40 a20,20 0 1,1 -40,10 a20,20 0 1,1 -40,-10 Z",
  patte:
    "M100,120 c-30,0 -45,25 -45,45 c0,15 12,25 27,25 c10,0 15,-6 18,-6 c3,0 8,6 18,6 c15,0 27,-10 27,-25 c0,-20 -15,-45 -45,-45 Z M55,80 a14,16 0 1,0 0.1,0 Z M145,80 a14,16 0 1,0 0.1,0 Z M75,45 a13,15 0 1,0 0.1,0 Z M125,45 a13,15 0 1,0 0.1,0 Z",
};

const viewBoxByShape: Record<ProductShape, string> = {
  ronde: "0 0 200 200",
  coeur: "0 0 200 185",
  os: "0 0 200 150",
  patte: "0 0 200 200",
};

export function MedalPlaceholder({
  shape,
  colors,
  seed = 0,
  className,
  caption,
}: {
  shape: ProductShape;
  colors: string[];
  seed?: number;
  className?: string;
  caption?: string;
}) {
  const [colorA, colorB] = [
    getColorHex(colors[0] ?? "ambre"),
    getColorHex(colors[1] ?? colors[0] ?? "ivoire"),
  ];
  const gradientId = `medal-gradient-${shape}-${colors.join("-")}-${seed}`;
  const angle = 45 + seed * 35;

  return (
    <div
      className={cn(
        "relative flex aspect-square items-center justify-center overflow-hidden rounded-card bg-cream-soft",
        className
      )}
    >
      <svg
        viewBox={viewBoxByShape[shape]}
        className="h-[68%] w-[68%] drop-shadow-[0_10px_20px_rgba(44,36,32,0.18)]"
        role="img"
        aria-label={caption ? `Aperçu de la médaille — ${caption}` : "Aperçu de la médaille"}
      >
        <defs>
          <linearGradient
            id={gradientId}
            gradientTransform={`rotate(${angle} 0.5 0.5)`}
          >
            <stop offset="0%" stopColor={colorA} />
            <stop offset="100%" stopColor={colorB} />
          </linearGradient>
        </defs>
        <path d={shapePaths[shape]} fill={`url(#${gradientId})`} stroke="rgba(44,36,32,0.15)" strokeWidth={2} />
      </svg>
      {caption && (
        <span className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-paper/80 px-3 py-1 text-[11px] font-medium text-ink-soft backdrop-blur-sm">
          {caption}
        </span>
      )}
      <span className="absolute right-3 top-3 rounded-full bg-paper/70 px-2 py-0.5 text-[10px] uppercase tracking-wide text-ink-soft/70">
        photo démo
      </span>
    </div>
  );
}
