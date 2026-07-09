"use client";

import { useEffect, useRef, useState } from "react";
import { toPng } from "html-to-image";
import { gooeyToast } from "goey-toast";
import { AppIcon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { Cancel01Icon, Copy01Icon, Download01Icon, Link01Icon, Share08Icon } from "@/lib/icons";
import { cn } from "@/lib/utils";
import { useShareModalStore } from "@/stores/share-modal-store";

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function ShareModal() {
  const { isOpen, payload, close } = useShareModalStore();
  const cardRef = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState<"copy" | "download" | "native" | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") close();
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [close, isOpen]);

  if (!isOpen || !payload) return null;

  const sharePayload = payload;
  const isComment = sharePayload.type === "comment";
  const title = isComment ? "Share comment" : "Share post";
  const filename = `choice9ja-${sharePayload.type}-${Date.now()}.png`;

  async function renderCard() {
    if (!cardRef.current) throw new Error("Share card unavailable");
    return toPng(cardRef.current, {
      cacheBust: true,
      pixelRatio: 2,
      backgroundColor: "#0f172a"
    });
  }

  async function copyImage() {
    try {
      setBusy("copy");
      const dataUrl = await renderCard();
      const blob = await (await fetch(dataUrl)).blob();
      if (typeof ClipboardItem !== "undefined" && navigator.clipboard?.write) {
        await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
        gooeyToast.success("Share card copied");
        return;
      }
      await navigator.clipboard.writeText(sharePayload.url);
      gooeyToast.success("Link copied");
    } catch {
      gooeyToast.error("Could not copy share card");
    } finally {
      setBusy(null);
    }
  }

  async function downloadImage() {
    try {
      setBusy("download");
      const dataUrl = await renderCard();
      const link = document.createElement("a");
      link.download = filename;
      link.href = dataUrl;
      link.click();
      gooeyToast.success("Share card downloaded");
    } catch {
      gooeyToast.error("Could not download share card");
    } finally {
      setBusy(null);
    }
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(sharePayload.url);
      gooeyToast.success("Link copied");
    } catch {
      gooeyToast.error("Could not copy link");
    }
  }

  async function nativeShare() {
    try {
      setBusy("native");
      const dataUrl = await renderCard();
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], filename, { type: "image/png" });

      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          title: "TheChoice9ja",
          text: sharePayload.message,
          url: sharePayload.url,
          files: [file]
        });
        return;
      }

      if (navigator.share) {
        await navigator.share({
          title: "TheChoice9ja",
          text: sharePayload.message,
          url: sharePayload.url
        });
        return;
      }

      await copyImage();
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") return;
      gooeyToast.error("Could not open share sheet");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <button type="button" aria-label="Close share modal" className="absolute inset-0 bg-slate-950/70 backdrop-blur-xl" onClick={close} />

      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-slate-950 shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-white/10 px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold text-white">{title}</h2>
            <p className="mt-1 text-sm text-slate-400">Preview your branded card, then copy, download, or share.</p>
          </div>
          <Button variant="ghost" size="icon" aria-label="Close" className="text-slate-300 hover:bg-white/10 hover:text-white" onClick={close}>
            <AppIcon icon={Cancel01Icon} size={18} />
          </Button>
        </div>

        <div className="space-y-4 p-5">
          <div
            ref={cardRef}
            className="relative overflow-hidden rounded-2xl border border-emerald-400/20 bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 p-5 text-white shadow-glow"
          >
            <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-emerald-400/15 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-16 -left-8 h-44 w-44 rounded-full bg-lime-400/10 blur-3xl" />

            <div className="relative mb-5 flex items-start justify-between gap-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-2.5 py-1.5 shadow-sm backdrop-blur-md">
                <img src="/legacy/logo.png" alt="TheChoice9ja" className="h-7 w-7 rounded-lg object-contain" />
                <div className="pr-1">
                  <p className="text-[11px] font-bold leading-none tracking-wide text-white">TheChoice9ja</p>
                  <p className="mt-0.5 text-[9px] font-medium uppercase tracking-[0.14em] text-emerald-200/90">Civic stamp</p>
                </div>
              </div>
              <span
                className={cn(
                  "rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide",
                  isComment ? "bg-sky-400/15 text-sky-200 ring-1 ring-sky-300/30" : "bg-emerald-400/15 text-emerald-200 ring-1 ring-emerald-300/30"
                )}
              >
                {isComment ? "Comment" : "Post"}
              </span>
            </div>

            {isComment && payload.quotedPost ? (
              <div className="relative mb-4 rounded-xl border border-white/10 bg-white/5 p-3">
                <div className="mb-2 flex items-center gap-2">
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-white/10 text-[10px] font-semibold text-emerald-200">
                    {initials(payload.quotedPost.author)}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold text-white">{payload.quotedPost.author}</p>
                    <p className="truncate text-[10px] text-slate-400">
                      {payload.quotedPost.handle}
                      {payload.quotedPost.topic ? ` · ${payload.quotedPost.topic}` : ""}
                    </p>
                  </div>
                </div>
                <p className="line-clamp-3 border-l-2 border-emerald-400/70 pl-3 text-[12px] leading-5 text-slate-300">
                  {payload.quotedPost.message}
                </p>
              </div>
            ) : null}

            <div className="relative">
              <div className="mb-3 flex items-center gap-2.5">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-emerald-400 to-lime-500 text-xs font-bold text-slate-950">
                  {initials(payload.author)}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-white">{payload.author}</p>
                  <p className="truncate text-xs text-slate-400">
                    {payload.handle ?? `@${payload.author.replace(/\s+/g, "").toLowerCase()}`}
                    {payload.topic ? ` · ${payload.topic}` : ""}
                  </p>
                </div>
              </div>
              <p className="text-[15px] leading-6 text-slate-100">{payload.message}</p>
            </div>

            <div className="relative mt-5 flex items-center justify-between border-t border-white/10 pt-3">
              <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-emerald-200/80">thechoice9ja.com</p>
              <p className="text-[10px] text-slate-500">Raise your voice</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            <Button variant="secondary" className="gap-1.5 bg-white/10 text-white hover:bg-white/15" onClick={nativeShare} disabled={Boolean(busy)}>
              <AppIcon icon={Share08Icon} size={15} />
              {busy === "native" ? "..." : "Share"}
            </Button>
            <Button variant="secondary" className="gap-1.5 bg-white/10 text-white hover:bg-white/15" onClick={copyImage} disabled={Boolean(busy)}>
              <AppIcon icon={Copy01Icon} size={15} />
              {busy === "copy" ? "..." : "Copy"}
            </Button>
            <Button variant="secondary" className="gap-1.5 bg-white/10 text-white hover:bg-white/15" onClick={downloadImage} disabled={Boolean(busy)}>
              <AppIcon icon={Download01Icon} size={15} />
              {busy === "download" ? "..." : "Save"}
            </Button>
            <Button variant="secondary" className="gap-1.5 bg-white/10 text-white hover:bg-white/15" onClick={copyLink} disabled={Boolean(busy)}>
              <AppIcon icon={Link01Icon} size={15} />
              Link
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
