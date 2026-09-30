"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { toPng } from "html-to-image";
import { gooeyToast } from "goey-toast";
import { AppIcon } from "@/components/ui/icon";
import { Cancel01Icon, Download01Icon, Link01Icon, Share08Icon } from "@/lib/icons";
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

function XLogo({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
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
    <div className={cn("mt-3 grid gap-0.5 overflow-hidden rounded-lg border border-[#EFF3F4]", gridClass)}>
      {images.map((item, index) => (
        <div
          key={item.id ?? item.url}
          className={cn(
            "relative overflow-hidden bg-[#EFF3F4]",
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
    if (!sharePayload) return;
    try {
      await navigator.clipboard.writeText(sharePayload.url);
      gooeyToast.success("Link copied");
    } catch {
      gooeyToast.error("Could not copy link");
    }
  }

  async function nativeShare() {
    if (!sharePayload) return;
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
    if (!sharePayload) return;
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

  function shareToX() {
    if (!sharePayload) return;
    const text = sharePayload.message.length > 200 ? `${sharePayload.message.slice(0, 197)}…` : sharePayload.message;
    const url = `https://x.com/intent/post?text=${encodeURIComponent(text)}&url=${encodeURIComponent(sharePayload.url)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  const handle = sharePayload.handle ?? `@${sharePayload.author.replace(/\s+/g, "").toLowerCase()}`;
  const targets: Array<{ key: string; label: string; onClick: () => void; icon: React.ReactNode; className: string }> = [
    {
      key: "link",
      label: "Copy link",
      onClick: copyLink,
      icon: <AppIcon icon={Link01Icon} size={22} />,
      className: "bg-secondary text-foreground hover:bg-secondary/70"
    },
    {
      key: "whatsapp",
      label: busy === "whatsapp" ? "Opening…" : "WhatsApp",
      onClick: shareWhatsApp,
      icon: <WhatsAppIcon size={22} />,
      className: "bg-[#25D366] text-white hover:bg-[#1ebe57]"
    },
    {
      key: "x",
      label: "X",
      onClick: shareToX,
      icon: <XLogo size={18} />,
      className: "bg-foreground text-background hover:bg-foreground/85"
    },
    {
      key: "save",
      label: busy === "download" ? "Saving…" : "Save image",
      onClick: downloadImage,
      icon: <AppIcon icon={Download01Icon} size={22} />,
      className: "bg-secondary text-foreground hover:bg-secondary/70"
    },
    {
      key: "more",
      label: busy === "native" ? "Opening…" : "More",
      onClick: nativeShare,
      icon: <AppIcon icon={Share08Icon} size={22} />,
      className: "bg-secondary text-foreground hover:bg-secondary/70"
    }
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:p-4">
      <button type="button" aria-label="Close" className="absolute inset-0 bg-black/60 backdrop-blur-[2px] dark:bg-black/70" onClick={close} />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative z-10 max-h-[92vh] w-full max-w-[440px] overflow-y-auto rounded-t-2xl border border-border bg-popover dark:border-white/10 sm:rounded-2xl"
      >
        <div className="flex items-center justify-between px-5 pb-2 pt-4">
          <h2 className="text-[17px] font-semibold">{title}</h2>
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="-mr-2 grid size-9 place-items-center rounded-full transition-colors hover:bg-accent"
          >
            <AppIcon icon={Cancel01Icon} size={20} />
          </button>
        </div>

        {/* Preview of the image that gets saved/shared. The card is always
            light: it becomes a PNG that people post elsewhere. */}
        <div className="mx-5 rounded-xl bg-secondary p-3">
          <div ref={cardRef} className="rounded-xl bg-white p-5 text-[#0F1419]">
            <div className="mb-4 flex items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/icon-192x192.png" alt="" className="size-6" />
              <span className="text-[13px] font-bold tracking-tight">Choice9ja</span>
            </div>

            {isComment && sharePayload.quotedPost ? (
              <div className="mb-4 rounded-lg border border-[#EFF3F4] p-3">
                <p className="text-[13px]">
                  <span className="font-bold">{sharePayload.quotedPost.author}</span>{" "}
                  <span className="text-[#536471]">{sharePayload.quotedPost.handle}</span>
                </p>
                <p className="mt-1 line-clamp-3 text-[13px] leading-[18px] text-[#536471]">{sharePayload.quotedPost.message}</p>
                {quotedImages.length ? <ShareMediaGrid items={quotedImages} /> : null}
              </div>
            ) : null}

            <div className="flex items-center gap-2.5">
              {sharePayload.authorAvatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={sharePayload.authorAvatar} alt="" crossOrigin="anonymous" className="size-9 rounded-full object-cover" />
              ) : (
                <span className="grid size-9 place-items-center rounded-full bg-[#EFF3F4] text-[13px] font-bold">
                  {initials(sharePayload.author)}
                </span>
              )}
              <div className="min-w-0 leading-[18px]">
                <p className="truncate text-[14px] font-bold">{sharePayload.author}</p>
                <p className="truncate text-[13px] text-[#536471]">{handle}</p>
              </div>
            </div>

            {sharePayload.message.trim() ? (
              <p className="mt-3 whitespace-pre-wrap break-words text-[16px] leading-[22px]">{sharePayload.message}</p>
            ) : null}
            {images.length ? <ShareMediaGrid items={images} /> : null}

            <p className="mt-4 text-[12px] text-[#536471]">
              {sharePayload.topic ? `${sharePayload.topic} · ` : ""}thechoice9ja.com
            </p>
          </div>
        </div>

        <div className="grid grid-cols-5 gap-1 px-3 pb-5 pt-4">
          {targets.map((target) => (
            <button
              key={target.key}
              type="button"
              onClick={() => void target.onClick()}
              disabled={Boolean(busy)}
              className="group flex flex-col items-center gap-1.5 rounded-lg py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
            >
              <span className={cn("grid size-12 place-items-center rounded-full transition-colors", target.className)}>
                {target.icon}
              </span>
              <span className="text-[12px] text-muted-foreground">{target.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
