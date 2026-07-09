"use client";

import { useState } from "react";
import { CivicVideoPlayer } from "@/components/media/civic-video-player";
import { MediaLightbox } from "@/components/media/media-lightbox";
import { AppIcon } from "@/components/ui/icon";
import { PlayIcon } from "@/lib/icons";
import { MEDIA_TILE_CAP } from "@/lib/media-utils";
import { cn } from "@/lib/utils";
import type { MediaAttachment } from "@/types";

type MediaAttachmentGridProps = {
  items: MediaAttachment[];
  className?: string;
  tileCap?: number;
};

export function MediaAttachmentGrid({ items, className, tileCap = MEDIA_TILE_CAP }: MediaAttachmentGridProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  if (!items.length) return null;

  const visible = items.slice(0, tileCap);
  const overflow = Math.max(items.length - tileCap, 0);

  return (
    <>
      <div
        className={cn(
          "mt-3 grid gap-1.5 overflow-hidden rounded-xl",
          visible.length === 1 && "grid-cols-1",
          visible.length === 2 && "grid-cols-2",
          visible.length >= 3 && "grid-cols-2",
          className
        )}
      >
        {visible.map((item, index) => {
          const isLast = index === visible.length - 1 && overflow > 0;
          const tall = visible.length === 1 || (visible.length === 3 && index === 0);

          return (
            <button
              key={`${item.url}-${index}`}
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                setLightboxIndex(index);
              }}
              className={cn(
                "relative overflow-hidden bg-muted",
                tall ? "min-h-52 sm:min-h-64" : "min-h-28 sm:min-h-36",
                visible.length === 3 && index === 0 && "row-span-2 min-h-full"
              )}
            >
              {item.type === "video" ? (
                <>
                  <video src={item.url} className="h-full w-full object-cover" muted playsInline preload="metadata" />
                  <span className="absolute inset-0 grid place-items-center bg-black/25">
                    <span className="grid h-10 w-10 place-items-center rounded-full bg-primary text-primary-foreground shadow-glow">
                      <AppIcon icon={PlayIcon} size={18} />
                    </span>
                  </span>
                </>
              ) : (
                <img src={item.url} alt="" className="h-full w-full object-cover" />
              )}

              {isLast ? (
                <span className="absolute inset-0 grid place-items-center bg-black/55 text-2xl font-semibold text-white">
                  +{overflow}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      {lightboxIndex != null ? (
        <MediaLightbox
          items={items}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onChange={setLightboxIndex}
        />
      ) : null}
    </>
  );
}

export function MediaAttachmentPreview({ items }: { items: MediaAttachment[] }) {
  if (!items.length) return null;
  if (items.length === 1 && items[0].type === "video") {
    return <CivicVideoPlayer src={items[0].url} className="mt-3 aspect-video w-full" />;
  }
  return <MediaAttachmentGrid items={items} />;
}
