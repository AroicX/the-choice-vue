import type { MediaAttachment, MediaKind } from "@/types";
import { mediaKindFromFile } from "@/lib/media-utils";

type CloudinarySignResponse = {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  signature: string;
  folder: string;
  resourceType: "image" | "video";
};

type CloudinaryUploadResponse = {
  public_id?: string;
  secure_url?: string;
  url?: string;
  bytes?: number;
  resource_type?: string;
  format?: string;
  error?: { message?: string };
};

async function getUploadSignature(resourceType: "image" | "video") {
  const response = await fetch("/api/cloudinary/sign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ resourceType })
  });

  const payload = (await response.json()) as CloudinarySignResponse & { message?: string };
  if (!response.ok) {
    throw new Error(payload.message || "Could not prepare upload");
  }

  return payload;
}

export const mediaService = {
  upload: async (file: File): Promise<MediaAttachment> => {
    const kind = mediaKindFromFile(file);
    if (!kind) {
      throw new Error("Only images and videos are allowed.");
    }

    const sign = await getUploadSignature(kind);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("api_key", sign.apiKey);
    formData.append("timestamp", String(sign.timestamp));
    formData.append("signature", sign.signature);
    formData.append("folder", sign.folder);

    const endpoint = `https://api.cloudinary.com/v1_1/${sign.cloudName}/${kind}/upload`;
    const response = await fetch(endpoint, {
      method: "POST",
      body: formData
    });

    const payload = (await response.json()) as CloudinaryUploadResponse;
    if (!response.ok || !payload.secure_url) {
      throw new Error(payload.error?.message || "Upload to Cloudinary failed");
    }

    const mediaKind: MediaKind = payload.resource_type === "video" || kind === "video" ? "video" : "image";

    return {
      id: payload.public_id,
      url: payload.secure_url,
      type: mediaKind,
      mimeType: file.type,
      size: payload.bytes ?? file.size
    };
  }
};
