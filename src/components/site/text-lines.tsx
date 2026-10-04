/** Affiche un texte saisi dans l'administration en conservant ses retours à la ligne. */
export function TextLines({ text }: { text: string }) {
  const lines = text.split(/\r?\n/);
  return (
    <>
      {lines.map((line, i) => (
        <span key={i}>
          {line}
          {i < lines.length - 1 ? <br /> : null}
        </span>
      ))}
    </>
  );
}

/** Lien interne ou externe sûr (http(s), mailto, chemin relatif). */
export function safeHref(href: string, fallback = "/"): string {
  const h = href.trim();
  if (h.startsWith("/") && !h.startsWith("//")) return h;
  if (/^https?:\/\//i.test(h) || /^mailto:/i.test(h)) return h;
  return fallback;
}
