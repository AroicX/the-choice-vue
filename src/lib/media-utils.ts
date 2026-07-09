import type { MediaAttachment, MediaAttachments, MediaKind } from "@/types";

export const IMAGE_MAX_BYTES = 3 * 1024 * 1024;
export const VIDEO_MAX_BYTES = 10 * 1024 * 1024;
export const MAX_MEDIA_ITEMS = 10;
export const MEDIA_TILE_CAP = 4;

const IMAGE_MIME = /^image\/(jpeg|jpg|png|gif|webp|avif)$/i;
const VIDEO_MIME = /^video\/(mp4|webm|quicktime|ogg)$/i;

export function isImageFile(file: File) {
  return IMAGE_MIME.test(file.type);
}

export function isVideoFile(file: File) {
  return VIDEO_MIME.test(file.type);
}

export function mediaKindFromFile(file: File): MediaKind | null {
  if (isImageFile(file)) return "image";
  if (isVideoFile(file)) return "video";
  return null;
}

export function validateMediaFile(file: File): string | null {
  const kind = mediaKindFromFile(file);
  if (!kind) return "Only images and videos are allowed.";
  if (kind === "image" && file.size > IMAGE_MAX_BYTES) return "Images must be 3MB or smaller.";
  if (kind === "video" && file.size > VIDEO_MAX_BYTES) return "Videos must be 10MB or smaller.";
  return null;
}

export function normalizeMediaAttachments(value: unknown): MediaAttachment[] {
  if (!value) return [];

  let items: unknown[] = [];
  if (Array.isArray(value)) {
    items = value;
  } else if (typeof value === "object") {
    const record = value as Record<string, unknown>;
    if (Array.isArray(record.items)) items = record.items;
    else if (Array.isArray(record.images) || Array.isArray(record.videos)) {
      items = [...(Array.isArray(record.images) ? record.images : []), ...(Array.isArray(record.videos) ? record.videos : [])];
    } else {
      items = Object.values(record).filter((item) => item && typeof item === "object");
    }
  }

  return items.reduce<MediaAttachment[]>((attachments, item) => {
      if (!item || typeof item !== "object") return attachments;
      const record = item as Record<string, unknown>;
      const url = String(record.url ?? "").trim();
      if (!url) return attachments;

      const mimeType = record.mimeType
        ? String(record.mimeType)
        : record.type && String(record.type).includes("/")
          ? String(record.type)
          : undefined;

      let type: MediaKind = "image";
      if (record.type === "video" || record.type === "image") type = record.type;
      else if (mimeType?.startsWith("video/")) type = "video";
      else if (/\.(mp4|webm|mov|ogg)(\?|$)/i.test(url)) type = "video";

      attachments.push({
        id: record.id ? String(record.id) : undefined,
        url,
        type,
        mimeType,
        size: record.size != null ? Number(record.size) : undefined
      });
      return attachments;
    }, []);
}

export function toAttachmentsPayload(items: MediaAttachment[]): MediaAttachments | Record<string, never> {
  if (!items.length) return {};
  return { items };
}

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
