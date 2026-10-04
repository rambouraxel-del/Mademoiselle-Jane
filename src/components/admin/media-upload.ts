"use client";

import { uploadMedia } from "@/app/admin/actions/media";
import type { MediaItem } from "@/lib/admin/types";

const MAX_SIDE = 2400;
const TARGET_BYTES = 3.5 * 1024 * 1024;

/**
 * Prépare la photo dans le navigateur (téléphone ou ordinateur) :
 * redimensionnement à 2400 px maximum pour un envoi rapide, sans recadrage
 * ni déformation. Le serveur revérifie ensuite le contenu.
 */
async function prepare(file: File): Promise<Blob> {
  if (!file.type.startsWith("image/")) return file;
  if (file.size <= 1.5 * 1024 * 1024 && file.type !== "image/heic") {
    // Petite image : envoyée telle quelle (le serveur la redimensionne si besoin).
    return file;
  }
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    return file; // format non décodable par le navigateur : le serveur tranchera
  }
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) return file;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const keepPng = file.type === "image/png";
  for (const quality of [0.92, 0.86, 0.8]) {
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, keepPng ? "image/png" : "image/jpeg", quality),
    );
    if (blob && (blob.size <= TARGET_BYTES || quality === 0.8)) return blob;
  }
  return file;
}

export async function uploadFile(file: File, alt = ""): Promise<{ ok: true; item: MediaItem } | { ok: false; error: string }> {
  const prepared = await prepare(file);
  if (prepared.size > 4 * 1024 * 1024) {
    return { ok: false, error: `${file.name} : image trop lourde même après préparation.` };
  }
  const form = new FormData();
  const name = file.name.replace(/\.[^.]+$/, "") + (prepared.type === "image/png" ? ".png" : ".jpg");
  form.set("file", new File([prepared], name, { type: prepared.type || file.type }));
  form.set("alt", alt);
  form.set("originalName", file.name);
  try {
    const result = await uploadMedia(form);
    if (result.ok && result.data) return { ok: true, item: result.data };
    return { ok: false, error: `${file.name} : ${result.ok ? "erreur inconnue" : result.error}` };
  } catch {
    return { ok: false, error: `${file.name} : envoi interrompu (connexion ?).` };
  }
}
