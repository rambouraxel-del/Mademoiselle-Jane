import "server-only";
import sharp, { type Metadata } from "sharp";

export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024; // après redimensionnement dans le navigateur
export const MAX_DIMENSION = 2400;
const ALLOWED_FORMATS = new Set(["jpeg", "png", "webp", "avif"]);

export type ProcessedImage = {
  buffer: Buffer;
  mimeType: "image/jpeg" | "image/png" | "image/webp";
  extension: "jpg" | "png" | "webp";
  width: number;
  height: number;
};

export class ImageValidationError extends Error {}

/**
 * Vérifie le CONTENU réel du fichier (pas seulement son extension), corrige
 * l'orientation, limite la taille et supprime les métadonnées (EXIF, GPS…).
 */
export async function processUpload(file: File): Promise<ProcessedImage> {
  if (file.size === 0) throw new ImageValidationError("Fichier vide.");
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new ImageValidationError("Image trop lourde (4 Mo maximum après préparation).");
  }
  const input = Buffer.from(await file.arrayBuffer());
  let meta: Metadata;
  try {
    meta = await sharp(input, { limitInputPixels: 60_000_000 }).metadata();
  } catch {
    throw new ImageValidationError("Ce fichier n’est pas une image lisible.");
  }
  if (!meta.format || !ALLOWED_FORMATS.has(meta.format)) {
    throw new ImageValidationError("Format non accepté : utilisez JPEG, PNG, WebP ou AVIF.");
  }
  if (!meta.width || !meta.height || meta.width < 200 || meta.height < 200) {
    throw new ImageValidationError("Image trop petite (200 × 200 pixels minimum).");
  }

  const keepAlpha = meta.hasAlpha === true && (meta.format === "png" || meta.format === "webp");
  const pipeline = sharp(input, { limitInputPixels: 60_000_000 })
    .rotate()
    .resize({ width: MAX_DIMENSION, height: MAX_DIMENSION, fit: "inside", withoutEnlargement: true });

  const { data, info } = keepAlpha
    ? await pipeline.png({ compressionLevel: 9 }).toBuffer({ resolveWithObject: true })
    : await pipeline.jpeg({ quality: 90, mozjpeg: true, chromaSubsampling: "4:4:4" }).toBuffer({ resolveWithObject: true });

  return {
    buffer: data,
    mimeType: keepAlpha ? "image/png" : "image/jpeg",
    extension: keepAlpha ? "png" : "jpg",
    width: info.width,
    height: info.height,
  };
}
