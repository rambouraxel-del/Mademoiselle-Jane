import { cn } from "@/utils/cn";
import type { ProductBadge } from "@/types";

const badgeLabels: Record<ProductBadge, string> = {
  nouveaute: "Nouveauté",
  populaire: "Populaire",
  "edition-limitee": "Édition limitée",
};

const badgeStyles: Record<ProductBadge, string> = {
  nouveaute: "bg-sage/15 text-sage",
  populaire: "bg-clay/15 text-clay-dark",
  "edition-limitee": "bg-ink/10 text-ink",
};

export function Badge({
  tone = "populaire",
  children,
  className,
}: {
  tone?: ProductBadge;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold tracking-wide",
        badgeStyles[tone],
        className
      )}
    >
      {children ?? badgeLabels[tone]}
    </span>
  );
}
