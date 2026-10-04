import Link from "next/link";
import { Fragment, type ReactNode } from "react";

/**
 * Rendu d'un texte simplifié saisi dans l'administration :
 *   ## Titre, ### Sous-titre, listes « - », **gras**, [lien](/adresse),
 *   et jetons {{nom}} remplacés par les informations commerciales.
 * Aucun HTML n'est interprété : impossible d'injecter du code.
 */

export type TokenValues = Record<string, string>;
export type BlockRenderers = Record<string, () => ReactNode>;

const INLINE = /(\*\*[^*\n]+\*\*|\[[^\]\n]+\]\([^)\s]+\)|\{\{[a-z_]+\}\})/g;

function safeHref(href: string): string | null {
  if (href.startsWith("/") && !href.startsWith("//")) return href;
  if (/^https:\/\/[^\s]+$/i.test(href) || /^mailto:[^\s]+$/i.test(href)) return href;
  return null;
}

function Missing({ label }: { label: string }) {
  return (
    <mark className="rounded bg-warning-bg px-1 text-warning" title="Information à compléter dans l’administration">
      [{label} : à compléter]
    </mark>
  );
}

export const TOKEN_LABELS: Record<string, string> = {
  business_name: "nom de l’entreprise",
  legal_status: "statut juridique",
  siret: "SIRET",
  address: "adresse",
  phone: "téléphone",
  vat_mention: "mention TVA",
  publication_director: "directeur·rice de la publication",
  host_info: "hébergeur",
  mediator: "médiateur",
  contact_email: "email de contact",
  default_fabrication_delay: "délai de fabrication",
};

function renderInline(text: string, tokens: TokenValues, keyPrefix: string): ReactNode[] {
  const parts = text.split(INLINE).filter((p) => p !== "");
  return parts.map((part, i) => {
    const key = `${keyPrefix}-${i}`;
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={key}>{renderInline(part.slice(2, -2), tokens, key)}</strong>;
    }
    const link = /^\[([^\]]+)\]\(([^)\s]+)\)$/.exec(part);
    if (link) {
      const href = safeHref(link[2]);
      if (!href) return <Fragment key={key}>{link[1]}</Fragment>;
      return href.startsWith("/") ? (
        <Link key={key} href={href}>
          {link[1]}
        </Link>
      ) : (
        <a key={key} href={href} rel="noopener noreferrer">
          {link[1]}
        </a>
      );
    }
    const token = /^\{\{([a-z_]+)\}\}$/.exec(part);
    if (token) {
      const value = tokens[token[1]]?.trim();
      if (value) {
        const lines = value.split(/\r?\n/);
        return (
          <Fragment key={key}>
            {lines.map((l, j) => (
              <Fragment key={j}>
                {l}
                {j < lines.length - 1 ? <br /> : null}
              </Fragment>
            ))}
          </Fragment>
        );
      }
      return <Missing key={key} label={TOKEN_LABELS[token[1]] ?? token[1]} />;
    }
    return <Fragment key={key}>{part}</Fragment>;
  });
}

function renderLines(text: string, tokens: TokenValues, keyPrefix: string): ReactNode[] {
  const lines = text.split("\n");
  return lines.flatMap((line, i) => {
    const nodes = renderInline(line, tokens, `${keyPrefix}-${i}`);
    return i < lines.length - 1 ? [...nodes, <br key={`${keyPrefix}-br-${i}`} />] : nodes;
  });
}

export function RichText({
  source,
  tokens = {},
  blocks = {},
  className = "prose-mj",
}: {
  source: string;
  tokens?: TokenValues;
  blocks?: BlockRenderers;
  className?: string;
}) {
  const chunks = source.replace(/\r\n/g, "\n").split(/\n{2,}/).map((c) => c.trim()).filter(Boolean);
  return (
    <div className={className}>
      {chunks.map((chunk, i) => {
        const key = `b${i}`;
        const blockToken = /^\{\{([a-z_]+)\}\}$/.exec(chunk);
        if (blockToken && blocks[blockToken[1]]) return <Fragment key={key}>{blocks[blockToken[1]]()}</Fragment>;
        if (chunk.startsWith("### ")) return <h3 key={key}>{renderInline(chunk.slice(4), tokens, key)}</h3>;
        if (chunk.startsWith("## ")) return <h2 key={key}>{renderInline(chunk.slice(3), tokens, key)}</h2>;
        const lines = chunk.split("\n");
        if (lines.every((l) => /^[-*] /.test(l))) {
          return (
            <ul key={key}>
              {lines.map((l, j) => (
                <li key={j}>{renderInline(l.slice(2), tokens, `${key}-${j}`)}</li>
              ))}
            </ul>
          );
        }
        return <p key={key}>{renderLines(chunk, tokens, key)}</p>;
      })}
    </div>
  );
}

/** Liste des jetons non renseignés dans un texte (pour l'alerte « à compléter »). */
export function missingTokens(source: string, tokens: TokenValues): string[] {
  const found = new Set<string>();
  for (const m of source.matchAll(/\{\{([a-z_]+)\}\}/g)) {
    if (m[1] in TOKEN_LABELS && !tokens[m[1]]?.trim()) found.add(TOKEN_LABELS[m[1]]);
  }
  return [...found];
}
