"use client";

import { useRef } from "react";
import { gooeyToast } from "goey-toast";
import { AppIcon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { Cancel01Icon, ImageAdd01Icon, Video01Icon } from "@/lib/icons";
import {
  MAX_MEDIA_ITEMS,
  formatBytes,
  mediaKindFromFile,
  validateMediaFile
} from "@/lib/media-utils";
import { mediaService } from "@/services/media.service";
import type { MediaAttachment } from "@/types";
import { cn } from "@/lib/utils";

export type PendingMedia = MediaAttachment & {
  localId: string;
  previewUrl?: string;
  uploading?: boolean;
  error?: string;
};

type MediaAttachmentPickerProps = {
  items: PendingMedia[];
  onChange: (items: PendingMedia[]) => void;
  disabled?: boolean;
  className?: string;
};

export function MediaAttachmentPicker({ items, onChange, disabled, className }: MediaAttachmentPickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFiles(fileList: FileList | null) {
    if (!fileList?.length) return;

    const remaining = MAX_MEDIA_ITEMS - items.length;
    if (remaining <= 0) {
      gooeyToast.info(`You can attach up to ${MAX_MEDIA_ITEMS} media files.`);
      return;
    }

    const selected = Array.from(fileList).slice(0, remaining);
    const nextItems = [...items];

    for (const file of selected) {
      const validationError = validateMediaFile(file);
      if (validationError) {
        gooeyToast.error(validationError);
        continue;
      }

      const kind = mediaKindFromFile(file)!;
      const localId = `local-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const previewUrl = URL.createObjectURL(file);
      const pending: PendingMedia = {
        localId,
        url: previewUrl,
        previewUrl,
        type: kind,
        mimeType: file.type,
        size: file.size,
        uploading: true
      };

      nextItems.push(pending);
      onChange([...nextItems]);

      try {
        const uploaded = await mediaService.upload(file);
        const index = nextItems.findIndex((item) => item.localId === localId);
        if (index >= 0) {
          URL.revokeObjectURL(previewUrl);
          nextItems[index] = {
            localId,
            id: uploaded.id,
            url: uploaded.url,
            type: uploaded.type,
            mimeType: uploaded.mimeType,
            size: uploaded.size,
            uploading: false
          };
          onChange([...nextItems]);
        }
      } catch (error) {
        const index = nextItems.findIndex((item) => item.localId === localId);
        if (index >= 0) {
          nextItems[index] = {
            ...nextItems[index],
            uploading: false,
            error: error instanceof Error ? error.message : "Upload failed"
          };
          onChange([...nextItems]);
        }
        gooeyToast.error("Upload failed", {
          description: error instanceof Error ? error.message : "Try again."
        });
      }
    }

    if (inputRef.current) inputRef.current.value = "";
  }

  function removeItem(localId: string) {
    const target = items.find((item) => item.localId === localId);
    if (target?.previewUrl) URL.revokeObjectURL(target.previewUrl);
    onChange(items.filter((item) => item.localId !== localId));
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex flex-wrap items-center gap-2">
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp,image/avif,video/mp4,video/webm,video/quicktime,video/ogg"
          multiple
          className="hidden"
          disabled={disabled || items.length >= MAX_MEDIA_ITEMS}
          onChange={(event) => void handleFiles(event.target.files)}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled || items.length >= MAX_MEDIA_ITEMS}
          onClick={() => inputRef.current?.click()}
          className="gap-1.5"
        >
          <AppIcon icon={ImageAdd01Icon} size={16} />
          Add media
        </Button>
        <p className="text-xs text-muted-foreground">
          Images ≤ 3MB · Videos ≤ 10MB · up to {MAX_MEDIA_ITEMS} files
        </p>
      </div>

      {items.length ? (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {items.map((item) => (
            <div key={item.localId} className="relative overflow-hidden rounded-xl border border-border/80 bg-muted">
              {item.type === "video" ? (
                <div className="relative aspect-square">
                  <video src={item.previewUrl ?? item.url} className="h-full w-full object-cover" muted />
                  <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-black/55 px-1.5 py-0.5 text-[10px] font-medium text-white">
                    <AppIcon icon={Video01Icon} size={12} />
                    Video
                  </span>
                </div>
              ) : (
                <img src={item.previewUrl ?? item.url} alt="" className="aspect-square w-full object-cover" />
              )}

              <button
                type="button"
                onClick={() => removeItem(item.localId)}
                className="absolute right-1.5 top-1.5 grid h-7 w-7 place-items-center rounded-full bg-black/55 text-white"
                aria-label="Remove media"
              >
                <AppIcon icon={Cancel01Icon} size={14} />
              </button>

              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-2 py-1.5 text-[10px] text-white">
                {item.uploading ? "Uploading..." : item.error ? item.error : item.size ? formatBytes(item.size) : "Ready"}
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function readyMediaAttachments(items: PendingMedia[]): MediaAttachment[] {
  return items
    .filter((item) => !item.uploading && !item.error && item.url && !item.url.startsWith("blob:"))
    .map(({ id, url, type, mimeType, size }) => ({ id, url, type, mimeType, size }));
}
