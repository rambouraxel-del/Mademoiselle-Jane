"use client";

import Link from "next/link";
import { useActionState } from "react";
import { requestPasswordReset, signIn, updatePassword } from "@/app/admin/actions/auth";
import { ActionMessage, SubmitButton } from "./forms";
import { inputClass, labelClass } from "./ui";

export function LoginForm() {
  const [state, action] = useActionState(signIn, null);
  return (
    <form action={action} className="space-y-4">
      <div>
        <label htmlFor="email" className={labelClass}>Adresse email</label>
        <input id="email" name="email" type="email" required autoComplete="username" className={inputClass} />
      </div>
      <div>
        <label htmlFor="password" className={labelClass}>Mot de passe</label>
        <input id="password" name="password" type="password" required autoComplete="current-password" className={inputClass} />
      </div>
      <ActionMessage state={state} />
      <SubmitButton pendingLabel="Connexion…" className="inline-flex min-h-11 w-full items-center justify-center rounded-md bg-rose px-4 py-2 font-medium text-white hover:bg-rose-dark disabled:opacity-60">
        Se connecter
      </SubmitButton>
      <p className="text-center text-sm">
        <Link href="/admin/mot-de-passe-oublie" className="text-rose-text underline underline-offset-2">Mot de passe oublié ?</Link>
      </p>
    </form>
  );
}

export function ResetRequestForm() {
  const [state, action] = useActionState(requestPasswordReset, null);
  return (
    <form action={action} className="space-y-4">
      <div>
        <label htmlFor="email" className={labelClass}>Adresse email du compte</label>
        <input id="email" name="email" type="email" required autoComplete="username" className={inputClass} />
      </div>
      <ActionMessage state={state} />
      <SubmitButton pendingLabel="Envoi…" className="inline-flex min-h-11 w-full items-center justify-center rounded-md bg-rose px-4 py-2 font-medium text-white hover:bg-rose-dark disabled:opacity-60">
        Recevoir le lien de réinitialisation
      </SubmitButton>
      <p className="text-center text-sm">
        <Link href="/admin/connexion" className="text-rose-text underline underline-offset-2">Retour à la connexion</Link>
      </p>
    </form>
  );
}

export function NewPasswordForm() {
  const [state, action] = useActionState(updatePassword, null);
  return (
    <form action={action} className="space-y-4">
      <div>
        <label htmlFor="password" className={labelClass}>Nouveau mot de passe (12 caractères minimum)</label>
        <input id="password" name="password" type="password" required minLength={12} autoComplete="new-password" className={inputClass} />
      </div>
      <div>
        <label htmlFor="confirm" className={labelClass}>Confirmer le mot de passe</label>
        <input id="confirm" name="confirm" type="password" required minLength={12} autoComplete="new-password" className={inputClass} />
      </div>
      <ActionMessage state={state} />
      <SubmitButton className="inline-flex min-h-11 w-full items-center justify-center rounded-md bg-rose px-4 py-2 font-medium text-white hover:bg-rose-dark disabled:opacity-60">
        Enregistrer le mot de passe
      </SubmitButton>
    </form>
  );
}
