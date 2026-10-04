"use client";

import Link from "next/link";
import Script from "next/script";
import { useActionState, useEffect, useId, useRef } from "react";
import { submitContact } from "@/app/actions/contact";

export function ContactForm({ formToken, turnstileSiteKey }: { formToken: string; turnstileSiteKey?: string }) {
  const [state, action, pending] = useActionState(submitContact, null);
  const id = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const errors = state && !state.ok ? (state.fieldErrors ?? {}) : {};

  useEffect(() => {
    if (state?.ok) formRef.current?.reset();
  }, [state]);

  const field = (name: string) => ({
    id: `${id}-${name}`,
    name,
    "aria-invalid": errors[name] ? (true as const) : undefined,
    "aria-describedby": errors[name] ? `${id}-${name}-error` : undefined,
  });
  const error = (name: string) =>
    errors[name] ? (
      <p id={`${id}-${name}-error`} className="mt-1 text-[0.8125rem] text-danger">
        {errors[name]}
      </p>
    ) : null;

  return (
    <form ref={formRef} action={action} className="space-y-4" noValidate>
      <input type="hidden" name="formToken" value={formToken} />
      <div aria-hidden="true" className="absolute left-[-9999px] h-px w-px overflow-hidden">
        <label>
          Ne pas remplir
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor={`${id}-name`} className="field-label">
            Votre nom
          </label>
          <input {...field("name")} className="field-input" required maxLength={120} autoComplete="name" />
          {error("name")}
        </div>
        <div>
          <label htmlFor={`${id}-email`} className="field-label">
            Votre e-mail
          </label>
          <input {...field("email")} type="email" className="field-input" required maxLength={254} autoComplete="email" />
          {error("email")}
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_12rem]">
        <div>
          <label htmlFor={`${id}-subject`} className="field-label">
            Objet <span className="text-brown-soft">(facultatif)</span>
          </label>
          <input {...field("subject")} className="field-input" maxLength={200} />
          {error("subject")}
        </div>
        <div>
          <label htmlFor={`${id}-orderNumber`} className="field-label">
            N° de commande <span className="text-brown-soft">(facultatif)</span>
          </label>
          <input {...field("orderNumber")} className="field-input" maxLength={40} placeholder="MJ-2026-00001" />
          {error("orderNumber")}
        </div>
      </div>
      <div>
        <label htmlFor={`${id}-message`} className="field-label">
          Votre message
        </label>
        <textarea {...field("message")} className="field-input min-h-40 resize-y" required maxLength={5000} rows={6} />
        {error("message")}
      </div>

      {turnstileSiteKey ? (
        <>
          <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer />
          <div className="cf-turnstile" data-sitekey={turnstileSiteKey} data-language="fr" />
        </>
      ) : null}

      <p className="text-[0.8125rem] text-brown-soft">
        Vos coordonnées servent uniquement à vous répondre.{" "}
        <Link href="/infos/confidentialite" className="underline underline-offset-2 hover:text-rose-text">
          Politique de confidentialité
        </Link>
      </p>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <button type="submit" className="btn btn-primary" disabled={pending}>
          {pending ? "Envoi en cours…" : "Envoyer le message"}
        </button>
        <p role="status" aria-live="polite" className="text-[0.95rem]">
          {state ? <span className={state.ok ? "text-success" : "text-danger"}>{state.ok ? state.message : state.error}</span> : null}
        </p>
      </div>
    </form>
  );
}
