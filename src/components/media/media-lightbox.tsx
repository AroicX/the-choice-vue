"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { CivicVideoPlayer } from "@/components/media/civic-video-player";
import { AppIcon } from "@/components/ui/icon";
import { ArrowLeft01Icon, ArrowRight01Icon, Cancel01Icon } from "@/lib/icons";
import type { MediaAttachment } from "@/types";

type MediaLightboxProps = {
  items: MediaAttachment[];
  index: number;
  onClose: () => void;
  onChange: (index: number) => void;
};

export function MediaLightbox({ items, index, onChange, onClose }: MediaLightboxProps) {
  const current = items[index];
  const [mounted, setMounted] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [direction, setDirection] = useState<"left" | "right" | null>(null);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  const goTo = useCallback(
    (newIndex: number, dir: "left" | "right") => {
      if (isTransitioning || newIndex === index || items.length < 2) return;
      setDirection(dir);
      setIsTransitioning(true);
      onChange(newIndex);
      window.setTimeout(() => {
        setIsTransitioning(false);
        setDirection(null);
      }, 220);
    },
    [index, isTransitioning, items.length, onChange]
  );

  const goPrev = useCallback(() => {
    goTo((index - 1 + items.length) % items.length, "left");
  }, [goTo, index, items.length]);

  const goNext = useCallback(() => {
    goTo((index + 1) % items.length, "right");
  }, [goTo, index, items.length]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") handleClose();
      if (event.key === "ArrowLeft") goPrev();
      if (event.key === "ArrowRight") goNext();
    }

    const previousOverflow = document.body.style.overflow;
    const previousPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.paddingRight = previousPaddingRight;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [handleClose, goPrev, goNext]);

  const onTouchStart = useCallback((event: React.TouchEvent) => {
    touchStartX.current = event.touches[0]?.clientX ?? null;
  }, []);

  const onTouchEnd = useCallback(
    (event: React.TouchEvent) => {
      if (touchStartX.current === null) return;
      const diff = touchStartX.current - (event.changedTouches[0]?.clientX ?? touchStartX.current);
      if (Math.abs(diff) > 50) {
        if (diff > 0) goNext();
        else goPrev();
      }
      touchStartX.current = null;
    },
    [goNext, goPrev]
  );

  if (!mounted || !current) return null;

  const isVideo = current.type === "video";

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex h-dvh w-screen items-center justify-center"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      role="dialog"
      aria-modal="true"
      aria-label="Media lightbox"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/90 backdrop-blur-xl"
        onClick={handleClose}
        aria-label="Close lightbox backdrop"
      />

      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-center justify-between px-4 py-4 sm:px-6">
        <div className="pointer-events-auto rounded-full border border-white/10 bg-white/10 px-3.5 py-1.5 text-xs font-medium text-white/85 backdrop-blur-md">
          {index + 1} <span className="text-white/40">/</span> {items.length}
        </div>
        <button
          type="button"
          onClick={handleClose}
          className="pointer-events-auto grid h-10 w-10 place-items-center rounded-full border border-white/15 bg-white/10 text-white shadow-lg backdrop-blur-md transition hover:bg-white/20"
          aria-label="Close lightbox"
        >
          <AppIcon icon={Cancel01Icon} size={18} />
        </button>
      </div>

      <div className="relative z-10 flex h-full w-full items-center justify-center px-12 sm:px-16">
        <div
          className={`flex max-h-[82dvh] max-w-6xl items-center justify-center transition-all duration-200 ease-out ${
            isTransitioning && direction === "right" ? "translate-x-6 scale-[0.98] opacity-0" : ""
          } ${isTransitioning && direction === "left" ? "-translate-x-6 scale-[0.98] opacity-0" : ""} ${
            !isTransitioning ? "translate-x-0 scale-100 opacity-100" : ""
          }`}
        >
          {isVideo ? (
            <CivicVideoPlayer
              src={current.url}
              className="max-h-[82dvh] w-full max-w-5xl rounded-xl"
              autoPlay
            />
          ) : (
            <img
              src={current.url}
              alt=""
              className="max-h-[82dvh] max-w-full rounded-lg object-contain shadow-2xl"
              draggable={false}
            />
          )}
        </div>
      </div>

      {items.length > 1 ? (
        <>
          <button
            type="button"
            onClick={goPrev}
            className="absolute left-3 top-1/2 z-20 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-white/15 bg-white/10 text-white shadow-lg backdrop-blur-md transition hover:bg-white/20 sm:left-5"
            aria-label="Previous media"
          >
            <AppIcon icon={ArrowLeft01Icon} size={20} />
          </button>
          <button
            type="button"
            onClick={goNext}
            className="absolute right-3 top-1/2 z-20 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-white/15 bg-white/10 text-white shadow-lg backdrop-blur-md transition hover:bg-white/20 sm:right-5"
            aria-label="Next media"
          >
            <AppIcon icon={ArrowRight01Icon} size={20} />
          </button>

          <div className="absolute bottom-4 left-1/2 z-20 hidden max-w-[min(80vw,42rem)] -translate-x-1/2 items-center gap-1.5 overflow-x-auto rounded-2xl border border-white/10 bg-black/50 p-2 backdrop-blur-xl sm:flex">
            {items.map((item, itemIndex) => (
              <button
                key={item.id ?? `${item.url}-${itemIndex}`}
                type="button"
                onClick={() => goTo(itemIndex, itemIndex > index ? "right" : "left")}
                className={`relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border-2 transition ${
                  itemIndex === index
                    ? "scale-105 border-white/80 shadow-lg"
                    : "border-transparent opacity-50 hover:opacity-80"
                }`}
                aria-label={`Go to media ${itemIndex + 1}`}
                aria-current={itemIndex === index ? "true" : undefined}
              >
                {item.type === "video" ? (
                  <div className="grid h-full w-full place-items-center bg-neutral-800 text-[10px] font-semibold uppercase tracking-wide text-white/70">
                    Vid
                  </div>
                ) : (
                  <img src={item.url} alt="" className="h-full w-full object-cover" draggable={false} />
                )}
              </button>
            ))}
          </div>

          <div className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1.5 sm:hidden">
            {items.map((_, itemIndex) => (
              <div
                key={itemIndex}
                className={`rounded-full transition-all ${
                  itemIndex === index ? "h-2 w-6 bg-white" : "h-2 w-2 bg-white/40"
                }`}
              />
            ))}
          </div>
        </>
      ) : null}
    </div>,
    document.body
  );
}
