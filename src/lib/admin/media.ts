import "server-only";
import type { MediaItem } from "@/lib/admin/types";
import { publicMediaUrl } from "@/lib/media/url";
import type { Database } from "@/lib/supabase/database.types";

export function mediaRowToItem(row: Database["public"]["Tables"]["media"]["Row"]): MediaItem {
  return {
    id: row.id,
    url: publicMediaUrl(row.path, row.bucket),
    path: row.path,
    width: row.width,
    height: row.height,
    alt: row.alt,
    focalX: row.focal_x,
    focalY: row.focal_y,
    isPlaceholder: row.is_placeholder,
    createdAt: row.created_at,
    sizeBytes: row.size_bytes,
    originalFilename: row.original_filename,
  };
}
