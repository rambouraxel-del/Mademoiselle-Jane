import { cn } from "@/utils/cn";

const palettes = [
  "from-clay-light via-amber-light to-cream-soft",
  "from-blush via-amber-light to-cream",
  "from-sage/40 via-cream-soft to-cream",
  "from-amber via-clay-light to-cream-soft",
];

/**
 * Bloc visuel de remplacement pour les photos lifestyle (hero, atelier,
 * galerie). À remplacer par de vraies photographies du produit fini.
 */
export function PhotoPlaceholder({
  label,
  variant = 0,
  className,
  rounded = true,
}: {
  label: string;
  variant?: number;
  className?: string;
  rounded?: boolean;
}) {
  const palette = palettes[variant % palettes.length];
  return (
    <div
      className={cn(
        "relative flex items-center justify-center overflow-hidden bg-gradient-to-br",
        palette,
        rounded && "rounded-card",
        className
      )}
    >
      <div className="pointer-events-none absolute inset-0 opacity-40 [background-image:radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.5),transparent_45%)]" />
      <span className="relative rounded-full bg-paper/75 px-4 py-1.5 text-xs font-medium uppercase tracking-wide text-ink-soft backdrop-blur-sm">
        {label} · photo démo
      </span>
    </div>
  );
}
