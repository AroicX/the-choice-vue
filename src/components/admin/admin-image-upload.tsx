"use client";

import { useEffect, useRef, useState } from "react";
import { gooeyToast } from "goey-toast";
import { AppIcon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { ImageAdd01Icon } from "@/lib/icons";
import { isImageFile, validateMediaFile } from "@/lib/media-utils";
import { mediaService } from "@/services/media.service";
import { cn } from "@/lib/utils";

type AdminImageUploadProps = {
  name: string;
  value?: string;
  onChange?: (url: string) => void;
  className?: string;
  label?: string;
};

export function AdminImageUpload({ name, value = "", onChange, className, label = "Image" }: AdminImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState(value);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    setPreview(value);
  }, [value]);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    if (!isImageFile(file)) {
      gooeyToast.error("Choose an image file");
      return;
    }
    const validationError = validateMediaFile(file);
    if (validationError) {
      gooeyToast.error(validationError);
      return;
    }

    const localUrl = URL.createObjectURL(file);
    setPreview(localUrl);
    setUploading(true);

    try {
      const uploaded = await mediaService.upload(file);
      setPreview(uploaded.url);
      onChange?.(uploaded.url);
      gooeyToast.success(`${label} uploaded`);
    } catch (error) {
      setPreview(value);
      gooeyToast.error("Upload failed", {
        description: error instanceof Error ? error.message : "Try another image."
      });
    } finally {
      URL.revokeObjectURL(localUrl);
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className={cn("space-y-3", className)}>
      <input type="hidden" name={name} value={preview} />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-border bg-muted">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt={label} className="h-full w-full object-cover" />
          ) : (
            <div className="grid h-full place-items-center text-muted-foreground">
              <AppIcon icon={ImageAdd01Icon} size={22} />
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <p className="text-xs text-muted-foreground">JPG, PNG, or WebP up to 3MB.</p>
          <div className="flex flex-wrap gap-2">
            <Button type="button" size="sm" variant="outline" disabled={uploading} onClick={() => inputRef.current?.click()}>
              {uploading ? "Uploading..." : preview ? "Change image" : "Upload image"}
            </Button>
            {preview ? (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                disabled={uploading}
                onClick={() => {
                  setPreview("");
                  onChange?.("");
                }}
              >
                Remove
              </Button>
            ) : null}
          </div>
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
        className="hidden"
        onChange={(event) => void handleFile(event.target.files?.[0])}
      />
    </div>
  );
}
