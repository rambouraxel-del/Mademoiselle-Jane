import { cn } from "@/utils/cn";

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3",
        align === "center" && "items-center text-center",
        className
      )}
    >
      {eyebrow && (
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-clay">
          {eyebrow}
        </span>
      )}
      <h2 className="font-display text-3xl text-ink sm:text-4xl">{title}</h2>
      {description && (
        <p className={cn("max-w-2xl text-ink-soft", align === "center" && "mx-auto")}>
          {description}
        </p>
      )}
    </div>
  );
}
