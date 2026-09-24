type ClassValue = string | number | null | false | undefined;

/** Fusionne des classes Tailwind conditionnelles sans dépendance externe. */
export function cn(...classes: ClassValue[]): string {
  return classes.filter(Boolean).join(" ");
}
