"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import { duplicateProduct, saveProduct } from "@/app/admin/actions/products";
import type { MediaItem } from "@/lib/admin/types";
import type { Product } from "@/lib/catalog/types";
import { centsToInput, slugify } from "@/lib/format";
import type { ActionResult } from "@/lib/validation/common";
import { ActionMessage, ConfirmAction } from "./forms";
import { MediaPicker } from "./media-picker";
import { Badge, Card, btnPrimary, btnSecondary, helpClass, inputClass, labelClass } from "./ui";

type VariantState = {
  id: string | null;
  ref: string;
  name: string;
  finish: string;
  swatch: string;
  price: string;
  stock: string;
  sku: string;
  isActive: boolean;
};
type ImageState = { key: string; media: MediaItem; variantRef: string | null; altOverride: string };

const SWATCH_PRESETS = [
  { label: "Doré", value: "linear-gradient(135deg, #f3dc9b 0%, #c99a3e 55%, #e9c97a 100%)" },
  { label: "Argenté", value: "linear-gradient(135deg, #f4f4f4 0%, #c3c5c8 55%, #e6e7e9 100%)" },
  { label: "Or rose", value: "linear-gradient(135deg, #f6d5c8 0%, #c98e7a 55%, #ecc1b1 100%)" },
  { label: "Noir", value: "#2b2b2b" },
];
const SHAPES = ["Ronde", "Fleur", "Ovale", "Cœur", "Os"];
const STATUS_LABELS = { draft: "Brouillon", published: "Publié", archived: "Archivé" } as const;

let refCounter = 0;
const newRef = () => `new-${Date.now()}-${refCounter++}`;

function mediaFromProduct(img: Product["images"][number]): MediaItem {
  return {
    id: img.media.id,
    url: img.media.url,
    path: img.media.path,
    width: img.media.width,
    height: img.media.height,
    alt: img.media.alt,
    focalX: img.media.focalX,
    focalY: img.media.focalY,
    isPlaceholder: img.media.isPlaceholder,
    createdAt: "",
    sizeBytes: 0,
    originalFilename: null,
  };
}

function Toggle({ label, checked, onChange, help }: { label: string; checked: boolean; onChange: (v: boolean) => void; help?: string }) {
  return (
    <label className="flex cursor-pointer items-start gap-3">
      <input type="checkbox" className="mt-1 h-4 w-4 accent-[var(--color-rose)]" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span>
        <span className="text-sm font-medium text-ink">{label}</span>
        {help ? <span className={`block ${helpClass}`}>{help}</span> : null}
      </span>
    </label>
  );
}

function move<T>(list: T[], index: number, delta: number): T[] {
  const target = index + delta;
  if (target < 0 || target >= list.length) return list;
  const copy = [...list];
  [copy[index], copy[target]] = [copy[target], copy[index]];
  return copy;
}

export function ProductForm({
  product,
  collections,
  okMessage,
}: {
  product: Product | null;
  collections: { id: string; name: string }[];
  okMessage?: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<ActionResult | null>(okMessage ? { ok: true, message: okMessage } : null);
  const [dirty, setDirty] = useState(false);
  const status = product?.status ?? "draft";

  const [f, setF] = useState(() => ({
    name: product?.name ?? "",
    slug: product?.slug ?? "",
    slugTouched: Boolean(product),
    shortDescription: product?.shortDescription ?? "",
    description: product?.description ?? "",
    basePrice: product ? centsToInput(product.basePriceCents) : "",
    shape: product?.shape ?? "",
    sizeLabel: product?.sizeLabel ?? "",
    material: product?.material ?? "Résine",
    dimensions: product?.dimensions ?? "",
    careInfo: product?.careInfo ?? "",
    personalizationInfo: product?.personalizationInfo ?? "",
    fabricationDelay: product?.fabricationDelay ?? "",
    stockMode: product?.stockMode ?? ("made_to_order" as "made_to_order" | "limited"),
    isAvailable: product?.isAvailable ?? true,
    sortOrder: product?.sortOrder ?? 99,
    isFeatured: product?.isFeatured ?? false,
    featuredOrder: product?.featuredOrder ?? 99,
    nameEnabled: product?.personalization.name.enabled ?? true,
    nameRequired: product?.personalization.name.required ?? true,
    nameMaxLength: product?.personalization.name.maxLength ?? 12,
    phoneEnabled: product?.personalization.phone.enabled ?? true,
    phoneRequired: product?.personalization.phone.required ?? false,
    phoneMaxLength: product?.personalization.phone.maxLength ?? 20,
    storyTitle: product?.storyTitle ?? "",
    storyText: product?.storyText ?? "",
    storyImage: product?.storyImage
      ? ({ ...product.storyImage, createdAt: "", sizeBytes: 0, originalFilename: null } as MediaItem)
      : (null as MediaItem | null),
    seoTitle: product?.seoTitle ?? "",
    seoDescription: product?.seoDescription ?? "",
    collections: product?.collections.map((c) => c.id) ?? [],
  }));
  const [variants, setVariants] = useState<VariantState[]>(
    () =>
      product?.variants.map((v) => ({
        id: v.id,
        ref: v.id,
        name: v.name,
        finish: v.finish,
        swatch: v.swatch,
        price: v.priceCents === product.basePriceCents ? "" : centsToInput(v.priceCents),
        stock: v.stockQuantity === null ? "" : String(v.stockQuantity),
        sku: v.sku,
        isActive: v.isActive,
      })) ?? [],
  );
  const [images, setImages] = useState<ImageState[]>(
    () =>
      product?.images.map((img) => ({
        key: img.id,
        media: mediaFromProduct(img),
        variantRef: img.variantId,
        altOverride: img.alt === img.media.alt || img.alt === product.name ? "" : img.alt,
      })) ?? [],
  );
  const [picker, setPicker] = useState<null | { mode: "add" } | { mode: "replace"; key: string } | { mode: "story" }>(null);

  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  function set<K extends keyof typeof f>(key: K, value: (typeof f)[K]) {
    setDirty(true);
    setF((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "name" && !prev.slugTouched) next.slug = slugify(String(value));
      return next;
    });
  }
  function updateVariant(index: number, patch: Partial<VariantState>) {
    setDirty(true);
    setVariants((list) => list.map((v, i) => (i === index ? { ...v, ...patch } : v)));
  }
  function updateImage(index: number, patch: Partial<ImageState>) {
    setDirty(true);
    setImages((list) => list.map((v, i) => (i === index ? { ...v, ...patch } : v)));
  }

  const fieldErrors = result && !result.ok ? (result.fieldErrors ?? {}) : {};
  const errorFor = (key: string) =>
    fieldErrors[key] ? <p className="mt-1 text-xs text-danger">{fieldErrors[key]}</p> : null;

  function submit(intent: "save" | "publish" | "unpublish" | "archive") {
    const payload = {
      id: product?.id ?? null,
      intent,
      currentStatus: status,
      name: f.name,
      slug: f.slug,
      shortDescription: f.shortDescription,
      description: f.description,
      basePrice: f.basePrice,
      shape: f.shape,
      sizeLabel: f.sizeLabel,
      material: f.material,
      dimensions: f.dimensions,
      careInfo: f.careInfo,
      personalizationInfo: f.personalizationInfo,
      fabricationDelay: f.fabricationDelay,
      stockMode: f.stockMode,
      isAvailable: f.isAvailable,
      sortOrder: Number(f.sortOrder) || 0,
      isFeatured: f.isFeatured,
      featuredOrder: Number(f.featuredOrder) || 0,
      nameEnabled: f.nameEnabled,
      nameRequired: f.nameRequired,
      nameMaxLength: Number(f.nameMaxLength),
      phoneEnabled: f.phoneEnabled,
      phoneRequired: f.phoneRequired,
      phoneMaxLength: Number(f.phoneMaxLength),
      storyTitle: f.storyTitle,
      storyText: f.storyText,
      storyImageId: f.storyImage?.id ?? null,
      seoTitle: f.seoTitle,
      seoDescription: f.seoDescription,
      variants: variants.map((v) => ({ ...v })),
      images: images.map((i) => ({ mediaId: i.media.id, variantRef: i.variantRef, altOverride: i.altOverride })),
      collections: f.collections,
    };
    startTransition(async () => {
      const r = await saveProduct(payload);
      setResult(r);
      if (r.ok) {
        setDirty(false);
        if (!product && r.data) router.replace(`/admin/produits/${r.data.id}?ok=cree`);
        else router.refresh();
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  const variantOptions = useMemo(() => variants.map((v) => ({ ref: v.ref, name: v.name || "(sans nom)" })), [variants]);

  const actionBar = (
    <div className="flex flex-wrap items-center gap-2">
      <button type="button" className={btnSecondary} disabled={pending} onClick={() => submit("save")}>
        {status === "published" ? "Enregistrer et mettre à jour le site" : "Enregistrer le brouillon"}
      </button>
      {status !== "published" ? (
        <button type="button" className={btnPrimary} disabled={pending} onClick={() => submit("publish")}>
          Publier
        </button>
      ) : (
        <button type="button" className={btnSecondary} disabled={pending} onClick={() => submit("unpublish")}>
          Dépublier
        </button>
      )}
      {product ? (
        <>
          <Link href={`/admin/produits/${product.id}/apercu`} className={btnSecondary} target="_blank">
            Aperçu privé ↗
          </Link>
          {status !== "archived" ? (
            <button type="button" className={btnSecondary} disabled={pending} onClick={() => submit("archive")}>
              Archiver
            </button>
          ) : null}
        </>
      ) : null}
      {pending ? <span className="text-sm text-brown-soft" role="status">Enregistrement…</span> : null}
    </div>
  );

  return (
    <div className="space-y-6 pb-24">
      <div className="flex flex-wrap items-center gap-3">
        <Badge tone={status === "published" ? "ok" : status === "draft" ? "wait" : "neutral"}>{STATUS_LABELS[status]}</Badge>
        {status === "published" && product ? (
          <Link href={`/medailles/${product.slug}`} target="_blank" className="text-sm text-rose-text underline">
            Voir sur le site ↗
          </Link>
        ) : (
          <span className="text-sm text-brown-soft">Invisible sur le site tant qu’il n’est pas publié.</span>
        )}
        {product ? (
          <ConfirmAction
            action={duplicateProduct}
            fields={{ id: product.id }}
            label="Dupliquer"
            danger={false}
            confirmTitle="Dupliquer ce produit ?"
            confirmText="Une copie sera créée en brouillon, avec les mêmes finitions, photos et collections."
            confirmLabel="Dupliquer"
          />
        ) : null}
      </div>

      <div aria-live="polite">
        <ActionMessage state={result} />
      </div>
      {dirty ? <p className="text-sm text-warning">Modifications non enregistrées.</p> : null}

      <Card title="Informations">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="p-name" className={labelClass}>Nom du produit</label>
            <input id="p-name" className={inputClass} value={f.name} maxLength={120} onChange={(e) => set("name", e.target.value)} />
            {errorFor("name")}
          </div>
          <div>
            <label htmlFor="p-slug" className={labelClass}>Adresse de la page (URL)</label>
            <div className="flex items-center gap-1 text-sm">
              <span className="text-brown-soft">/medailles/</span>
              <input
                id="p-slug"
                className={inputClass}
                value={f.slug}
                maxLength={80}
                onChange={(e) => {
                  setF((prev) => ({ ...prev, slug: slugify(e.target.value), slugTouched: true }));
                  setDirty(true);
                }}
              />
            </div>
            {errorFor("slug")}
            {product && status === "published" ? <p className={helpClass}>Changer l’adresse d’un produit publié casse les liens déjà partagés.</p> : null}
          </div>
          <div className="md:col-span-2">
            <label htmlFor="p-short" className={labelClass}>Description courte (sous le nom)</label>
            <textarea id="p-short" className={inputClass} rows={2} maxLength={400} value={f.shortDescription} onChange={(e) => set("shortDescription", e.target.value)} />
            {errorFor("shortDescription")}
          </div>
          <div className="md:col-span-2">
            <label htmlFor="p-desc" className={labelClass}>Description détaillée (« Détails du produit »)</label>
            <textarea id="p-desc" className={inputClass} rows={5} maxLength={8000} value={f.description} onChange={(e) => set("description", e.target.value)} />
          </div>
        </div>
      </Card>

      <Card title="Prix et finitions">
        <div className="max-w-xs">
          <label htmlFor="p-price" className={labelClass}>Prix de base (€)</label>
          <input id="p-price" className={inputClass} inputMode="decimal" value={f.basePrice} onChange={(e) => set("basePrice", e.target.value)} placeholder="18,00" />
          {errorFor("basePrice")}
        </div>
        <p className={`${helpClass} mb-3 mt-4`}>
          Les finitions (dorée, argentée…) sont des variantes du même produit. Laissez le prix vide pour utiliser le prix de base.
        </p>
        <ul className="space-y-3">
          {variants.map((v, i) => (
            <li key={v.ref} className="rounded-md border border-line p-3">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1.2fr_1fr_1.2fr_0.8fr_0.8fr]">
                <div>
                  <label className={labelClass} htmlFor={`v-name-${v.ref}`}>Nom</label>
                  <input
                    id={`v-name-${v.ref}`}
                    className={inputClass}
                    value={v.name}
                    maxLength={60}
                    onChange={(e) => updateVariant(i, { name: e.target.value, ...(v.id ? {} : { finish: slugify(e.target.value) }) })}
                  />
                </div>
                <div>
                  <label className={labelClass} htmlFor={`v-key-${v.ref}`}>Clé de filtre</label>
                  <input id={`v-key-${v.ref}`} className={inputClass} value={v.finish} maxLength={40} onChange={(e) => updateVariant(i, { finish: slugify(e.target.value) })} />
                </div>
                <div>
                  <label className={labelClass} htmlFor={`v-swatch-${v.ref}`}>Pastille de couleur</label>
                  <div className="flex items-center gap-2">
                    <span className="h-8 w-8 shrink-0 rounded-full border border-line" style={{ background: v.swatch || "transparent" }} aria-hidden="true" />
                    <select
                      id={`v-swatch-${v.ref}`}
                      className={inputClass}
                      value={SWATCH_PRESETS.find((s) => s.value === v.swatch)?.value ?? (v.swatch ? "custom" : "")}
                      onChange={(e) => e.target.value !== "custom" && updateVariant(i, { swatch: e.target.value })}
                    >
                      <option value="">Aucune</option>
                      {SWATCH_PRESETS.map((s) => (
                        <option key={s.label} value={s.value}>{s.label}</option>
                      ))}
                      {v.swatch && !SWATCH_PRESETS.some((s) => s.value === v.swatch) ? <option value="custom">Personnalisée</option> : null}
                    </select>
                  </div>
                </div>
                <div>
                  <label className={labelClass} htmlFor={`v-price-${v.ref}`}>Prix (€)</label>
                  <input id={`v-price-${v.ref}`} className={inputClass} inputMode="decimal" placeholder={f.basePrice || "—"} value={v.price} onChange={(e) => updateVariant(i, { price: e.target.value })} />
                </div>
                <div>
                  <label className={labelClass} htmlFor={`v-stock-${v.ref}`}>Stock</label>
                  <input
                    id={`v-stock-${v.ref}`}
                    className={inputClass}
                    inputMode="numeric"
                    disabled={f.stockMode !== "limited"}
                    placeholder={f.stockMode === "limited" ? "0" : "À la commande"}
                    value={f.stockMode === "limited" ? v.stock : ""}
                    onChange={(e) => updateVariant(i, { stock: e.target.value.replace(/\D/g, "") })}
                  />
                </div>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <Toggle label="Active (proposée à la vente)" checked={v.isActive} onChange={(val) => updateVariant(i, { isActive: val })} />
                <div className="ml-auto flex gap-1">
                  <button type="button" className={btnSecondary} onClick={() => { setVariants((l) => move(l, i, -1)); setDirty(true); }} disabled={i === 0} aria-label={`Monter ${v.name}`}>↑</button>
                  <button type="button" className={btnSecondary} onClick={() => { setVariants((l) => move(l, i, 1)); setDirty(true); }} disabled={i === variants.length - 1} aria-label={`Descendre ${v.name}`}>↓</button>
                  <button
                    type="button"
                    className={btnSecondary}
                    onClick={() => {
                      if (v.id && !window.confirm(`Supprimer la finition « ${v.name} » ? Les commandes passées gardent leurs informations.`)) return;
                      setVariants((l) => l.filter((_, j) => j !== i));
                      setImages((l) => l.map((img) => (img.variantRef === v.ref ? { ...img, variantRef: null } : img)));
                      setDirty(true);
                    }}
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
        {Object.entries(fieldErrors).filter(([k]) => k.startsWith("variants")).map(([k, m]) => (
          <p key={k} className="mt-1 text-xs text-danger">{m}</p>
        ))}
        <button
          type="button"
          className={`${btnSecondary} mt-3`}
          onClick={() => {
            setVariants((l) => [...l, { id: null, ref: newRef(), name: "", finish: "", swatch: "", price: "", stock: "", sku: "", isActive: true }]);
            setDirty(true);
          }}
        >
          + Ajouter une finition
        </button>
      </Card>

      <Card title="Photos" actions={<button type="button" className={btnPrimary} onClick={() => setPicker({ mode: "add" })}>+ Ajouter des photos</button>}>
        <p className={`${helpClass} mb-3`}>
          La première photo est la photo principale. Associez une photo à une finition pour qu’elle s’affiche quand cette finition est choisie.
        </p>
        {images.length === 0 ? (
          <p className="rounded-md border border-dashed border-line-strong p-6 text-center text-sm text-brown-soft">Aucune photo pour le moment.</p>
        ) : (
          <ul className="space-y-3">
            {images.map((img, i) => (
              <li key={img.key} className="grid gap-3 rounded-md border border-line p-3 sm:grid-cols-[7rem_minmax(0,1fr)_auto]">
                <div className="relative aspect-square w-28 overflow-hidden rounded bg-ivory">
                  <Image src={img.media.url} alt="" fill sizes="112px" className="object-cover" style={{ objectPosition: `${img.media.focalX}% ${img.media.focalY}%` }} />
                  {i === 0 ? <span className="absolute left-1 top-1 rounded bg-rose px-1.5 text-[0.65rem] text-white">Principale</span> : null}
                  {img.media.isPlaceholder ? <span className="absolute bottom-1 left-1 rounded bg-warning-bg px-1 text-[0.6rem] text-warning">provisoire</span> : null}
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  <div>
                    <label className={labelClass} htmlFor={`img-v-${img.key}`}>Finition</label>
                    <select id={`img-v-${img.key}`} className={inputClass} value={img.variantRef ?? ""} onChange={(e) => updateImage(i, { variantRef: e.target.value || null })}>
                      <option value="">Toutes les finitions</option>
                      {variantOptions.map((v) => (
                        <option key={v.ref} value={v.ref}>{v.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass} htmlFor={`img-alt-${img.key}`}>Texte alternatif (facultatif)</label>
                    <input id={`img-alt-${img.key}`} className={inputClass} maxLength={300} placeholder={img.media.alt || "Description de la photo"} value={img.altOverride} onChange={(e) => updateImage(i, { altOverride: e.target.value })} />
                  </div>
                </div>
                <div className="flex flex-wrap items-start gap-1 sm:flex-col">
                  <div className="flex gap-1">
                    <button type="button" className={btnSecondary} onClick={() => { setImages((l) => move(l, i, -1)); setDirty(true); }} disabled={i === 0} aria-label="Monter la photo">↑</button>
                    <button type="button" className={btnSecondary} onClick={() => { setImages((l) => move(l, i, 1)); setDirty(true); }} disabled={i === images.length - 1} aria-label="Descendre la photo">↓</button>
                  </div>
                  <button type="button" className={btnSecondary} onClick={() => setPicker({ mode: "replace", key: img.key })}>Remplacer</button>
                  <button type="button" className={btnSecondary} onClick={() => { setImages((l) => l.filter((_, j) => j !== i)); setDirty(true); }}>Retirer</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Personnalisation">
          <div className="space-y-4">
            <fieldset className="space-y-2 rounded-md border border-line p-3">
              <legend className="px-1 text-sm font-medium text-ink">Prénom</legend>
              <Toggle label="Proposer le prénom" checked={f.nameEnabled} onChange={(v) => set("nameEnabled", v)} />
              <Toggle label="Obligatoire" checked={f.nameRequired && f.nameEnabled} onChange={(v) => set("nameRequired", v)} />
              <div className="max-w-[10rem]">
                <label className={labelClass} htmlFor="p-name-max">Longueur maximale</label>
                <input id="p-name-max" type="number" min={1} max={60} className={inputClass} value={f.nameMaxLength} onChange={(e) => set("nameMaxLength", Number(e.target.value))} />
              </div>
              {errorFor("nameMaxLength")}
            </fieldset>
            <fieldset className="space-y-2 rounded-md border border-line p-3">
              <legend className="px-1 text-sm font-medium text-ink">Téléphone au dos</legend>
              <Toggle label="Proposer le téléphone" checked={f.phoneEnabled} onChange={(v) => set("phoneEnabled", v)} />
              <Toggle label="Obligatoire" checked={f.phoneRequired && f.phoneEnabled} onChange={(v) => set("phoneRequired", v)} />
              <div className="max-w-[10rem]">
                <label className={labelClass} htmlFor="p-phone-max">Longueur maximale</label>
                <input id="p-phone-max" type="number" min={6} max={30} className={inputClass} value={f.phoneMaxLength} onChange={(e) => set("phoneMaxLength", Number(e.target.value))} />
              </div>
              {errorFor("phoneMaxLength")}
            </fieldset>
            <div>
              <label className={labelClass} htmlFor="p-perso">Texte « Personnalisation » (fiche produit)</label>
              <textarea id="p-perso" rows={3} className={inputClass} value={f.personalizationInfo} onChange={(e) => set("personalizationInfo", e.target.value)} />
            </div>
          </div>
        </Card>

        <Card title="Caractéristiques">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass} htmlFor="p-shape">Forme (filtre boutique)</label>
              <input id="p-shape" list="shapes" className={inputClass} value={f.shape} maxLength={40} onChange={(e) => set("shape", e.target.value)} />
              <datalist id="shapes">
                {SHAPES.map((s) => <option key={s} value={s} />)}
              </datalist>
            </div>
            <div>
              <label className={labelClass} htmlFor="p-size">Diamètre affiché</label>
              <input id="p-size" className={inputClass} value={f.sizeLabel} maxLength={40} placeholder="2,5 cm" onChange={(e) => set("sizeLabel", e.target.value)} />
            </div>
            <div>
              <label className={labelClass} htmlFor="p-material">Matière</label>
              <input id="p-material" className={inputClass} value={f.material} maxLength={120} onChange={(e) => set("material", e.target.value)} />
            </div>
            <div>
              <label className={labelClass} htmlFor="p-dim">Dimensions</label>
              <input id="p-dim" className={inputClass} value={f.dimensions} maxLength={200} placeholder="Diamètre 2,5 cm" onChange={(e) => set("dimensions", e.target.value)} />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass} htmlFor="p-delay">Délai de fabrication indicatif</label>
              <input id="p-delay" className={inputClass} value={f.fabricationDelay} maxLength={200} placeholder="Vide = délai par défaut (Informations commerciales)" onChange={(e) => set("fabricationDelay", e.target.value)} />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass} htmlFor="p-care">Entretien</label>
              <textarea id="p-care" rows={3} className={inputClass} value={f.careInfo} onChange={(e) => set("careInfo", e.target.value)} />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Disponibilité et stock">
          <div className="space-y-4">
            <Toggle label="Disponible à la vente" help="Décochez pour afficher le produit sans permettre de le commander." checked={f.isAvailable} onChange={(v) => set("isAvailable", v)} />
            <fieldset>
              <legend className={labelClass}>Mode de stock</legend>
              <label className="flex items-center gap-2 text-sm">
                <input type="radio" name="stockMode" className="accent-[var(--color-rose)]" checked={f.stockMode === "made_to_order"} onChange={() => set("stockMode", "made_to_order")} />
                Fabrication à la commande (pas de limite)
              </label>
              <label className="mt-1 flex items-center gap-2 text-sm">
                <input type="radio" name="stockMode" className="accent-[var(--color-rose)]" checked={f.stockMode === "limited"} onChange={() => set("stockMode", "limited")} />
                Quantité limitée (stock par finition)
              </label>
            </fieldset>
          </div>
        </Card>
        <Card title="Mise en avant et ordre">
          <div className="space-y-4">
            <Toggle label="Mettre en avant sur l’accueil (« Les petits coups de cœur »)" checked={f.isFeatured} onChange={(v) => set("isFeatured", v)} />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass} htmlFor="p-forder">Ordre sur l’accueil</label>
                <input id="p-forder" type="number" min={0} className={inputClass} value={f.featuredOrder} onChange={(e) => set("featuredOrder", Number(e.target.value))} />
              </div>
              <div>
                <label className={labelClass} htmlFor="p-sorder">Ordre en boutique</label>
                <input id="p-sorder" type="number" min={0} className={inputClass} value={f.sortOrder} onChange={(e) => set("sortOrder", Number(e.target.value))} />
              </div>
            </div>
            <p className={helpClass}>
              Plus simple : réorganisez par glisser des flèches depuis{" "}
              <Link href="/admin/produits/ordre" className="underline">Ordre d’affichage</Link>.
            </p>
          </div>
        </Card>
      </div>

      <Card title="Collections">
        {collections.length === 0 ? (
          <p className="text-sm text-brown-soft">Aucune collection. <Link href="/admin/collections" className="underline">Créer une collection</Link></p>
        ) : (
          <div className="flex flex-wrap gap-3">
            {collections.map((c) => (
              <label key={c.id} className="flex items-center gap-2 rounded-full border border-line px-3 py-1.5 text-sm">
                <input
                  type="checkbox"
                  className="accent-[var(--color-rose)]"
                  checked={f.collections.includes(c.id)}
                  onChange={(e) => set("collections", e.target.checked ? [...f.collections, c.id] : f.collections.filter((x) => x !== c.id))}
                />
                {c.name}
              </label>
            ))}
          </div>
        )}
      </Card>

      <Card title="Bandeau « Les petits détails » (facultatif)">
        <p className={`${helpClass} mb-3`}>Laissez vide pour utiliser le texte commun à toutes les fiches (Contenus du site → Fiches produits).</p>
        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_14rem]">
          <div className="space-y-3">
            <div>
              <label className={labelClass} htmlFor="p-st">Titre</label>
              <input id="p-st" className={inputClass} value={f.storyTitle} maxLength={160} onChange={(e) => set("storyTitle", e.target.value)} />
            </div>
            <div>
              <label className={labelClass} htmlFor="p-stx">Texte</label>
              <textarea id="p-stx" rows={3} className={inputClass} value={f.storyText} maxLength={1000} onChange={(e) => set("storyText", e.target.value)} />
            </div>
          </div>
          <div>
            <p className={labelClass}>Image</p>
            <div className="relative aspect-[4/3] overflow-hidden rounded border border-line bg-ivory">
              {f.storyImage ? <Image src={f.storyImage.url} alt="" fill sizes="224px" className="object-cover" /> : <span className="flex h-full items-center justify-center text-xs text-brown-soft">Image par défaut</span>}
            </div>
            <div className="mt-2 flex gap-2">
              <button type="button" className={btnSecondary} onClick={() => setPicker({ mode: "story" })}>{f.storyImage ? "Remplacer" : "Choisir"}</button>
              {f.storyImage ? <button type="button" className={btnSecondary} onClick={() => set("storyImage", null)}>Retirer</button> : null}
            </div>
          </div>
        </div>
      </Card>

      <Card title="Référencement (SEO)">
        <div className="grid gap-4">
          <div>
            <label className={labelClass} htmlFor="p-seot">Titre pour Google ({f.seoTitle.length}/70)</label>
            <input id="p-seot" className={inputClass} maxLength={70} value={f.seoTitle} placeholder={f.name} onChange={(e) => set("seoTitle", e.target.value)} />
          </div>
          <div>
            <label className={labelClass} htmlFor="p-seod">Description pour Google ({f.seoDescription.length}/170)</label>
            <textarea id="p-seod" rows={2} className={inputClass} maxLength={170} value={f.seoDescription} placeholder={f.shortDescription} onChange={(e) => set("seoDescription", e.target.value)} />
          </div>
          <div className="rounded-md bg-ivory p-3 text-sm">
            <p className="text-[#1a0dab]">{(f.seoTitle || f.name || "Nom du produit") + " — Mademoizelle Jane"}</p>
            <p className="text-success">…/medailles/{f.slug || "adresse"}</p>
            <p className="text-brown">{f.seoDescription || f.shortDescription || "Description…"}</p>
          </div>
        </div>
      </Card>

      <div className="sticky bottom-0 z-20 -mx-4 border-t border-line bg-white/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-10 lg:px-10">{actionBar}</div>

      <MediaPicker
        open={picker !== null}
        multiple={picker?.mode === "add"}
        title={picker?.mode === "add" ? "Ajouter des photos" : "Choisir une photo"}
        onClose={() => setPicker(null)}
        onSelect={(items) => {
          setDirty(true);
          if (picker?.mode === "add") {
            setImages((l) => [...l, ...items.map((m) => ({ key: newRef(), media: m, variantRef: null, altOverride: "" }))]);
          } else if (picker?.mode === "replace") {
            const key = picker.key;
            setImages((l) => l.map((img) => (img.key === key && items[0] ? { ...img, media: items[0] } : img)));
          } else if (picker?.mode === "story") {
            set("storyImage", items[0] ?? null);
          }
        }}
      />
    </div>
  );
}
