"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { toPng } from "html-to-image";
import { gooeyToast } from "goey-toast";
import { AppIcon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { Cancel01Icon, Copy01Icon, Download01Icon, Link01Icon, Share08Icon } from "@/lib/icons";
import { cn } from "@/lib/utils";
import { useShareModalStore } from "@/stores/share-modal-store";
import type { MediaAttachment } from "@/types";

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function imageAttachments(items?: MediaAttachment[]) {
  return (items ?? []).filter((item) => item.type === "image" && Boolean(item.url?.trim()));
}

function WhatsAppIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function ShareMediaGrid({ items }: { items: MediaAttachment[] }) {
  const images = items.slice(0, 4);
  if (!images.length) return null;

  const count = images.length;
  const gridClass =
    count === 1 ? "grid-cols-1" : count === 2 ? "grid-cols-2" : count === 3 ? "grid-cols-2" : "grid-cols-2";

  return (
    <div className={cn("mt-3 grid gap-1 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100", gridClass)}>
      {images.map((item, index) => (
        <div
          key={item.id ?? item.url}
          className={cn(
            "relative overflow-hidden bg-slate-200",
            count === 1 ? "aspect-[16/10]" : "aspect-square",
            count === 3 && index === 0 && "row-span-2 aspect-auto min-h-full"
          )}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.url}
            alt=""
            crossOrigin="anonymous"
            className="h-full w-full object-cover"
            draggable={false}
          />
        </div>
      ))}
    </div>
  );
}

export function ShareModal() {
  const { isOpen, payload, close } = useShareModalStore();
  const cardRef = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState<"copy" | "download" | "native" | "whatsapp" | null>(null);

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

  const sharePayload = payload;
  const images = useMemo(() => imageAttachments(sharePayload?.attachments), [sharePayload?.attachments]);
  const quotedImages = useMemo(
    () => imageAttachments(sharePayload?.quotedPost?.attachments),
    [sharePayload?.quotedPost?.attachments]
  );

  if (!isOpen || !sharePayload) return null;

  const isComment = sharePayload.type === "comment";
  const title = isComment ? "Share comment" : "Share post";
  const filename = `choice9ja-${sharePayload.type}-${Date.now()}.png`;

  async function waitForImages() {
    if (!cardRef.current) return;
    const nodes = [...cardRef.current.querySelectorAll("img")];
    await Promise.all(
      nodes.map(
        (img) =>
          new Promise<void>((resolve) => {
            if (img.complete && img.naturalWidth > 0) {
              resolve();
              return;
            }
            const done = () => resolve();
            img.addEventListener("load", done, { once: true });
            img.addEventListener("error", done, { once: true });
          })
      )
    );
  }

  async function renderCard() {
    if (!cardRef.current) throw new Error("Share card unavailable");
    await waitForImages();
    return toPng(cardRef.current, {
      cacheBust: true,
      pixelRatio: 2,
      backgroundColor: "#ffffff",
      skipFonts: false
    });
  }

  async function cardAsFile() {
    const dataUrl = await renderCard();
    const blob = await (await fetch(dataUrl)).blob();
    return { dataUrl, blob, file: new File([blob], filename, { type: "image/png" }) };
  }

  async function copyImage() {
    try {
      setBusy("copy");
      const { blob } = await cardAsFile();
      if (typeof ClipboardItem !== "undefined" && navigator.clipboard?.write) {
        await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
        gooeyToast.success("Share image copied");
        return;
      }
      await navigator.clipboard.writeText(sharePayload.url);
      gooeyToast.success("Link copied");
    } catch {
      gooeyToast.error("Could not copy share image");
    } finally {
      setBusy(null);
    }
  }

  async function downloadImage() {
    try {
      setBusy("download");
      const { dataUrl } = await cardAsFile();
      const link = document.createElement("a");
      link.download = filename;
      link.href = dataUrl;
      link.click();
      gooeyToast.success("PNG downloaded");
    } catch {
      gooeyToast.error("Could not download PNG");
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
      const { file } = await cardAsFile();

      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          title: "TheChoice9ja",
          text: sharePayload.message,
          files: [file]
        });
        return;
      }

      if (navigator.share) {
        await navigator.share({
          title: "TheChoice9ja",
          text: `${sharePayload.message}\n\n${sharePayload.url}`
        });
        return;
      }

      await downloadImage();
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") return;
      gooeyToast.error("Could not open share sheet");
    } finally {
      setBusy(null);
    }
  }

  async function shareWhatsApp() {
    try {
      setBusy("whatsapp");
      const { file } = await cardAsFile();
      const text = `${sharePayload.message}\n\n${sharePayload.url}`;

      // Mobile: share PNG directly into WhatsApp via the system sheet (X-style).
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          title: "TheChoice9ja",
          text,
          files: [file]
        });
        gooeyToast.success("Pick WhatsApp to send the image");
        return;
      }

      // Desktop fallback: open WhatsApp with caption + link; PNG still available via Save.
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
      gooeyToast.info("WhatsApp opened — use Save PNG to attach the image");
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") return;
      const text = `${sharePayload.message}\n\n${sharePayload.url}`;
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center p-0 sm:items-center sm:p-4">
      <button type="button" aria-label="Close share modal" className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]" onClick={close} />

      <div className="relative z-10 max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-3xl border border-slate-200 bg-white shadow-2xl sm:rounded-3xl">
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-100 bg-white/95 px-5 py-4 backdrop-blur">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
            <p className="mt-1 text-sm text-slate-500">Preview the card, then download a PNG or share to WhatsApp.</p>
          </div>
          <Button variant="ghost" size="icon" aria-label="Close" className="text-slate-500 hover:bg-slate-100 hover:text-slate-900" onClick={close}>
            <AppIcon icon={Cancel01Icon} size={18} />
          </Button>
        </div>

        <div className="space-y-4 p-5">
          <div
            ref={cardRef}
            className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 text-slate-900 shadow-sm"
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1.5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/legacy/logo.png" alt="TheChoice9ja" className="h-7 w-7 rounded-lg object-contain" />
                <div className="pr-1">
                  <p className="text-[11px] font-bold leading-none tracking-wide text-slate-900">TheChoice9ja</p>
                  <p className="mt-0.5 text-[9px] font-medium uppercase tracking-[0.14em] text-emerald-700">Civic share</p>
                </div>
              </div>
              <span
                className={cn(
                  "rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide",
                  isComment ? "bg-sky-50 text-sky-700 ring-1 ring-sky-200" : "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                )}
              >
                {isComment ? "Comment" : "Post"}
              </span>
            </div>

            {isComment && sharePayload.quotedPost ? (
              <div className="mb-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="mb-2 flex items-center gap-2">
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-emerald-100 text-[10px] font-semibold text-emerald-800">
                    {initials(sharePayload.quotedPost.author)}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold text-slate-900">{sharePayload.quotedPost.author}</p>
                    <p className="truncate text-[10px] text-slate-500">
                      {sharePayload.quotedPost.handle}
                      {sharePayload.quotedPost.topic ? ` · ${sharePayload.quotedPost.topic}` : ""}
                    </p>
                  </div>
                </div>
                <p className="line-clamp-3 border-l-2 border-emerald-500 pl-3 text-[12px] leading-5 text-slate-600">
                  {sharePayload.quotedPost.message}
                </p>
                {quotedImages.length ? <ShareMediaGrid items={quotedImages} /> : null}
              </div>
            ) : null}

            <div>
              <div className="mb-3 flex items-center gap-2.5">
                {sharePayload.authorAvatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={sharePayload.authorAvatar}
                    alt={sharePayload.author}
                    crossOrigin="anonymous"
                    className="h-9 w-9 rounded-full object-cover"
                  />
                ) : (
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-emerald-500 to-lime-500 text-xs font-bold text-white">
                    {initials(sharePayload.author)}
                  </span>
                )}
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900">{sharePayload.author}</p>
                  <p className="truncate text-xs text-slate-500">
                    {sharePayload.handle ?? `@${sharePayload.author.replace(/\s+/g, "").toLowerCase()}`}
                    {sharePayload.topic ? ` · ${sharePayload.topic}` : ""}
                  </p>
                </div>
              </div>

              {images.length ? <ShareMediaGrid items={images} /> : null}

              <p className={cn("text-[15px] leading-6 text-slate-800", images.length && "mt-3")}>{sharePayload.message}</p>
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-3">
              <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-emerald-700">thechoice9ja.com</p>
              <p className="text-[10px] text-slate-400">Raise your voice</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <Button
              className="gap-1.5 bg-[#25D366] text-white hover:bg-[#1ebe57]"
              onClick={shareWhatsApp}
              disabled={Boolean(busy)}
            >
              <WhatsAppIcon size={15} />
              {busy === "whatsapp" ? "..." : "WhatsApp"}
            </Button>
            <Button variant="outline" className="gap-1.5 border-slate-200 bg-white text-slate-800 hover:bg-slate-50" onClick={downloadImage} disabled={Boolean(busy)}>
              <AppIcon icon={Download01Icon} size={15} />
              {busy === "download" ? "..." : "Save PNG"}
            </Button>
            <Button variant="outline" className="gap-1.5 border-slate-200 bg-white text-slate-800 hover:bg-slate-50" onClick={nativeShare} disabled={Boolean(busy)}>
              <AppIcon icon={Share08Icon} size={15} />
              {busy === "native" ? "..." : "Share"}
            </Button>
            <Button variant="outline" className="gap-1.5 border-slate-200 bg-white text-slate-800 hover:bg-slate-50" onClick={copyImage} disabled={Boolean(busy)}>
              <AppIcon icon={Copy01Icon} size={15} />
              {busy === "copy" ? "..." : "Copy image"}
            </Button>
          </div>

          <Button variant="ghost" className="w-full gap-1.5 text-slate-600 hover:bg-slate-50 hover:text-slate-900" onClick={copyLink} disabled={Boolean(busy)}>
            <AppIcon icon={Link01Icon} size={15} />
            Copy link
          </Button>
        </div>
      </div>
    </div>
  );
}
