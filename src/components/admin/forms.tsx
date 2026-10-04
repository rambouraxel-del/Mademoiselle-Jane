"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect, useRef, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import type { ActionResult } from "@/lib/validation/common";
import { Notice, btnDanger, btnPrimary, btnSecondary } from "./ui";

type Action = (prev: ActionResult | null, formData: FormData) => Promise<ActionResult>;

export function SubmitButton({
  children,
  pendingLabel = "Enregistrement…",
  className = btnPrimary,
  name,
  value,
}: {
  children: ReactNode;
  pendingLabel?: string;
  className?: string;
  name?: string;
  value?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={className} disabled={pending} name={name} value={value} aria-busy={pending}>
      {pending ? pendingLabel : children}
    </button>
  );
}

export function ActionMessage({ state }: { state: ActionResult | null }) {
  if (!state) return null;
  return state.ok ? (
    <Notice tone="ok">{state.message ?? "Enregistré."}</Notice>
  ) : (
    <Notice tone="error">
      {state.error}
      {state.fieldErrors && Object.keys(state.fieldErrors).length > 0 ? (
        <ul className="mt-1 list-disc pl-5 text-sm">
          {Object.entries(state.fieldErrors).map(([k, v]) => (
            <li key={k}>{v}</li>
          ))}
        </ul>
      ) : null}
    </Notice>
  );
}

/** Formulaire branché sur une action serveur, avec message de réussite ou d'erreur. */
export function ActionForm({
  action,
  children,
  className = "space-y-4",
  resetOnSuccess = false,
  refreshOnSuccess = true,
  footer,
}: {
  action: Action;
  children: ReactNode;
  className?: string;
  resetOnSuccess?: boolean;
  refreshOnSuccess?: boolean;
  footer?: ReactNode;
}) {
  const [state, formAction] = useActionState(action, null);
  const ref = useRef<HTMLFormElement>(null);
  const router = useRouter();
  useEffect(() => {
    if (state?.ok) {
      if (resetOnSuccess) ref.current?.reset();
      if (refreshOnSuccess) router.refresh();
    }
  }, [state, resetOnSuccess, refreshOnSuccess, router]);
  return (
    <form ref={ref} action={formAction} className={className}>
      {children}
      <div aria-live="polite">
        <ActionMessage state={state} />
      </div>
      {footer}
    </form>
  );
}

/**
 * Bouton d'action avec confirmation (fenêtre de dialogue) pour les
 * opérations destructives ou importantes.
 */
export function ConfirmAction({
  action,
  fields,
  label,
  confirmTitle,
  confirmText,
  confirmLabel = "Confirmer",
  danger = true,
  className,
  onDone,
}: {
  action: Action;
  fields: Record<string, string>;
  label: ReactNode;
  confirmTitle: string;
  confirmText: ReactNode;
  confirmLabel?: string;
  danger?: boolean;
  className?: string;
  onDone?: (state: ActionResult) => void;
}) {
  const [state, formAction] = useActionState(action, null);
  const dialog = useRef<HTMLDialogElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!state) return;
    dialog.current?.close();
    if (state.ok) router.refresh();
    onDone?.(state);
  }, [state, router, onDone]);

  return (
    <>
      <button
        type="button"
        className={className ?? (danger ? btnDanger : btnSecondary)}
        onClick={() => dialog.current?.showModal()}
      >
        {label}
      </button>
      {state && !state.ok ? (
        <span className="text-sm text-danger" role="alert">
          {state.error}
        </span>
      ) : null}
      <dialog
        ref={dialog}
        className="m-auto w-[min(92vw,28rem)] rounded-lg border border-line bg-white p-0 text-ink shadow-xl backdrop:bg-ink/40"
        aria-labelledby="confirm-title"
      >
        <form action={formAction} className="p-5">
          {Object.entries(fields).map(([k, v]) => (
            <input key={k} type="hidden" name={k} value={v} />
          ))}
          <h2 id="confirm-title" className="font-serif text-xl">
            {confirmTitle}
          </h2>
          <div className="mt-2 text-sm text-brown">{confirmText}</div>
          <div className="mt-5 flex justify-end gap-2">
            <button type="button" className={btnSecondary} onClick={() => dialog.current?.close()}>
              Annuler
            </button>
            <SubmitButton className={danger ? `${btnDanger} !bg-danger !text-white` : btnPrimary} pendingLabel="En cours…">
              {confirmLabel}
            </SubmitButton>
          </div>
        </form>
      </dialog>
    </>
  );
}
