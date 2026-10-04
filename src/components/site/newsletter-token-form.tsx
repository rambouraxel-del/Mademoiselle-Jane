"use client";

import { useActionState } from "react";
import { confirmNewsletter, unsubscribeNewsletter } from "@/app/actions/newsletter";

export function NewsletterTokenForm({ token, mode }: { token: string; mode: "confirm" | "unsubscribe" }) {
  const [state, action, pending] = useActionState(mode === "confirm" ? confirmNewsletter : unsubscribeNewsletter, null);
  if (state?.ok) return <p className="text-[1.1rem] text-success" role="status">{state.message}</p>;
  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="token" value={token} />
      <button type="submit" className="btn btn-primary" disabled={pending}>
        {mode === "confirm" ? "Je confirme mon inscription" : "Me désinscrire"}
      </button>
      {state && !state.ok ? <p className="text-danger" role="alert">{state.error}</p> : null}
    </form>
  );
}
