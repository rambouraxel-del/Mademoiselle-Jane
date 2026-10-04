"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { saveSection } from "@/app/admin/actions/content";
import { NamedIcon } from "@/components/icons";
import type { MediaItem } from "@/lib/admin/types";
import { ICON_LABELS, ICONS, type SectionDef } from "@/lib/content/sections";
import { ActionMessage, SubmitButton } from "./forms";
import { ImageField } from "./media-picker";
import { Card, helpClass, inputClass, labelClass } from "./ui";

/** Formulaire généré à partir de la description d'une section de contenus. */
export function SectionForm({
  section,
  values,
  images,
}: {
  section: SectionDef;
  values: Record<string, string | boolean>;
  images: Record<string, MediaItem | null>;
}) {
  const [state, action] = useActionState(saveSection, null);
  const router = useRouter();
  useEffect(() => {
    if (state?.ok) router.refresh();
  }, [state, router]);
  const errors = state && !state.ok ? (state.fieldErrors ?? {}) : {};

  return (
    <form action={action} className="space-y-6 pb-20">
      <input type="hidden" name="sectionKey" value={section.key} />
      <div aria-live="polite">
        <ActionMessage state={state} />
      </div>
      {section.groups.map((group) => (
        <Card key={group.title} title={group.title}>
          <div className="grid gap-4 md:grid-cols-2">
            {group.fields.map((field) => {
              const id = `f-${field.key}`;
              const value = values[field.key];
              const err = errors[field.key];
              const wide = field.type === "textarea" || field.type === "image";
              return (
                <div key={field.key} className={wide ? "md:col-span-2" : ""}>
                  {field.type === "boolean" ? (
                    <label className="flex items-center gap-2 text-sm font-medium text-ink">
                      <input type="checkbox" name={field.key} defaultChecked={value === true} className="h-4 w-4 accent-[var(--color-rose)]" />
                      {field.label}
                    </label>
                  ) : field.type === "image" ? (
                    <ImageField name={field.key} label={field.label} initial={images[field.key] ?? null} help={field.help} />
                  ) : field.type === "icon" ? (
                    <>
                      <label htmlFor={id} className={labelClass}>{field.label}</label>
                      <div className="flex items-center gap-3">
                        <NamedIcon name={String(value)} size={32} className="shrink-0 text-ink" />
                        <select id={id} name={field.key} defaultValue={String(value)} className={inputClass}>
                          {ICONS.map((icon) => (
                            <option key={icon} value={icon}>{ICON_LABELS[icon]}</option>
                          ))}
                        </select>
                      </div>
                    </>
                  ) : (
                    <>
                      <label htmlFor={id} className={labelClass}>
                        {field.label}
                        {field.required && !String(value ?? "").trim() ? <span className="ml-2 text-xs font-normal text-warning">à compléter</span> : null}
                      </label>
                      {field.type === "textarea" ? (
                        <textarea id={id} name={field.key} defaultValue={String(value ?? "")} rows={3} maxLength={field.max} className={inputClass} aria-invalid={err ? true : undefined} />
                      ) : (
                        <input
                          id={id}
                          name={field.key}
                          type={field.type === "email" ? "email" : field.type === "url" ? "url" : "text"}
                          defaultValue={String(value ?? "")}
                          maxLength={field.max}
                          placeholder={field.type === "link" ? "/medailles" : field.type === "url" ? "https://…" : undefined}
                          className={inputClass}
                          aria-invalid={err ? true : undefined}
                        />
                      )}
                    </>
                  )}
                  {field.help && field.type !== "image" ? <p className={helpClass}>{field.help}</p> : null}
                  {field.type === "textarea" ? <p className={helpClass}>Un retour à la ligne dans ce champ crée un retour à la ligne sur le site.</p> : null}
                  {err ? <p className="mt-1 text-xs text-danger">{err}</p> : null}
                </div>
              );
            })}
          </div>
        </Card>
      ))}
      <div className="sticky bottom-0 z-20 -mx-4 border-t border-line bg-white/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-10 lg:px-10">
        <SubmitButton>Enregistrer et publier</SubmitButton>
      </div>
    </form>
  );
}
