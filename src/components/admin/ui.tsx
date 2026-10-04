import Link from "next/link";
import type { ReactNode } from "react";

export function PageHeader({
  title,
  description,
  actions,
  back,
}: {
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
  back?: { href: string; label: string };
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {back ? (
          <Link href={back.href} className="mb-2 inline-block text-sm text-brown-soft hover:text-rose-text">
            ← {back.label}
          </Link>
        ) : null}
        <h1 className="font-serif text-[2rem] leading-tight text-ink sm:text-[2.3rem]">{title}</h1>
        {description ? <p className="mt-1 max-w-3xl text-[0.95rem] text-brown-soft">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}

export function Card({ title, children, className = "", actions }: { title?: string; children: ReactNode; className?: string; actions?: ReactNode }) {
  return (
    <section className={`rounded-md border border-line bg-white p-4 shadow-sm sm:p-6 ${className}`}>
      {title || actions ? (
        <div className="mb-4 flex items-center justify-between gap-3">
          {title ? <h2 className="font-serif text-[1.35rem] text-ink">{title}</h2> : <span />}
          {actions}
        </div>
      ) : null}
      {children}
    </section>
  );
}

export function Badge({ tone = "neutral", children }: { tone?: "ok" | "wait" | "bad" | "neutral" | "info"; children: ReactNode }) {
  const tones = {
    ok: "bg-success-bg text-success",
    wait: "bg-warning-bg text-warning",
    bad: "bg-danger-bg text-danger",
    neutral: "bg-ivory-deep text-brown",
    info: "bg-blush-soft text-rose-dark",
  };
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${tones[tone]}`}>{children}</span>;
}

export function Notice({ tone, children }: { tone: "ok" | "error" | "warning" | "info"; children: ReactNode }) {
  const tones = {
    ok: "border-success/30 bg-success-bg text-success",
    error: "border-danger/30 bg-danger-bg text-danger",
    warning: "border-warning/30 bg-warning-bg text-warning",
    info: "border-blush-line bg-blush-soft text-ink",
  };
  return (
    <div role={tone === "error" ? "alert" : "status"} className={`rounded-md border px-4 py-3 text-[0.95rem] ${tones[tone]}`}>
      {children}
    </div>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return <p className="rounded-md border border-dashed border-line-strong px-4 py-10 text-center text-brown-soft">{children}</p>;
}

export const inputClass =
  "w-full rounded-md border border-line-strong bg-white px-3 py-2.5 text-[0.95rem] text-ink focus:border-rose focus:outline-none focus:ring-2 focus:ring-rose/20";
export const labelClass = "mb-1 block text-sm font-medium text-ink";
export const helpClass = "mt-1 text-xs text-brown-soft";
export const btnClass =
  "inline-flex min-h-10 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50";
export const btnPrimary = `${btnClass} bg-rose text-white hover:bg-rose-dark`;
export const btnSecondary = `${btnClass} border border-line-strong bg-white text-ink hover:border-rose hover:text-rose-dark`;
export const btnDanger = `${btnClass} border border-danger/40 bg-white text-danger hover:bg-danger-bg`;
export const btnGhost = `${btnClass} text-brown hover:bg-ivory-deep`;
