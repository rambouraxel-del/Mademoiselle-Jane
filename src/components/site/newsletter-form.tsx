"use client";

import Link from "next/link";
import { useActionState, useId } from "react";
import { subscribeNewsletter } from "@/app/actions/newsletter";
import { CONSENT_TEXT } from "@/lib/newsletter/consent";

export function NewsletterForm({ compact = false }: { compact?: boolean }) {
  const [state, action, pending] = useActionState(subscribeNewsletter, null);
  const id = useId();
  return (
    <form action={action} className="w-full" noValidate={false}>
      <div className="flex w-full">
        <label htmlFor={`${id}-email`} className="visually-hidden">
          Votre adresse e-mail
        </label>
        <input
          id={`${id}-email`}
          name="email"
          type="email"
          required
          autoComplete="email"
          maxLength={254}
          placeholder="Votre adresse e-mail"
          className="min-w-0 flex-1 rounded-l-[0.25rem] border border-r-0 border-line-strong bg-[#fffdfa] px-4 py-2.5 text-[0.9375rem] text-ink placeholder:text-[#9b8e85] focus:border-rose focus:outline-none"
        />
        <button
          type="submit"
          disabled={pending}
          className="shrink-0 rounded-r-[0.25rem] bg-rose px-5 py-2.5 text-[0.9375rem] font-medium text-white transition-colors hover:bg-rose-dark disabled:opacity-60 sm:px-7"
        >
          {pending ? "Envoi…" : "S’inscrire"}
        </button>
      </div>
      {/* Champ piège pour les robots (invisible pour les personnes) */}
      <div aria-hidden="true" className="absolute left-[-9999px] h-px w-px overflow-hidden">
        <label>
          Ne pas remplir
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <label className={`mt-2.5 flex items-start gap-2 text-[0.78rem] leading-snug text-brown-soft ${compact ? "" : "max-w-md"}`}>
        <input type="checkbox" name="consent" required className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--color-rose)]" />
        <span>
          {CONSENT_TEXT}{" "}
          <Link href="/infos/confidentialite" className="underline underline-offset-2 hover:text-rose-text">
            Confidentialité
          </Link>
        </span>
      </label>
      <p role="status" aria-live="polite" className="mt-2 min-h-5 text-sm">
        {state ? (
          <span className={state.ok ? "text-success" : "text-danger"}>{state.ok ? state.message : state.error}</span>
        ) : null}
      </p>
    </form>
  );
}
