import "server-only";
import { revalidatePath } from "next/cache";

/**
 * Les pages publiques sont rendues à la demande ; on invalide en plus tout
 * cache de rendu éventuel pour qu'une modification publiée apparaisse
 * immédiatement, sans redéploiement.
 */
export function revalidateSite() {
  revalidatePath("/", "layout");
}
