"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { toPng } from "html-to-image";
import { gooeyToast } from "goey-toast";
import { AppIcon } from "@/components/ui/icon";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Cancel01Icon, Download01Icon, Share08Icon } from "@/lib/icons";
import { asArray, normalizePolitician } from "@/lib/content-utils";
import { cn } from "@/lib/utils";
import { endpoints } from "@/services/client/endpoints";
import { getData } from "@/services/client/api";
import { politiciansService } from "@/services/politicians.service";
import type { ApiRecord, Politician } from "@/types";

type CompareMetric = {
  key: string;
  label: string;
  a: number;
  b: number;
  delta: number;
  leader: string;
};

type CompareResult = {
  politicianA: { politician: ApiRecord; scorecard: ApiRecord };
  politicianB: { politician: ApiRecord; scorecard: ApiRecord };
  metrics: CompareMetric[];
  summary: { aWins: number; bWins: number; ties: number };
};

type PoliticiansCompareModalProps = {
  open: boolean;
  onClose: () => void;
  politicians: Politician[];
  initialLeftId?: string;
  initialRightId?: string;
};

function WhatsAppIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function PartyLogo({
  name,
  image,
  size = 20,
  className
}: {
  name?: string;
  image?: string;
  size?: number;
  className?: string;
}) {
  const label = (name ?? "Party").trim() || "Party";
  if (image) {
    return (
      <span
        className={cn("relative inline-flex shrink-0 overflow-hidden rounded-full border border-slate-200 bg-white", className)}
        style={{ width: size, height: size }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={image} alt={`${label} logo`} crossOrigin="anonymous" className="h-full w-full object-contain p-0.5" />
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-[9px] font-bold uppercase text-slate-600",
        className
      )}
      style={{ width: size, height: size }}
      title={label}
    >
      {label.slice(0, 3)}
    </span>
  );
}

function CandidatePick({
  label,
  selected,
  options,
  search,
  onSearch,
  onSelect,
  excludeId
}: {
  label: string;
  selected: Politician | null;
  options: Politician[];
  search: string;
  onSearch: (value: string) => void;
  onSelect: (id: string) => void;
  excludeId?: string;
}) {
  const filtered = options
    .filter((person) => person.id !== excludeId)
    .filter((person) => {
      const term = search.trim().toLowerCase();
      if (!term) return true;
      return [person.name, person.party, person.position, person.state].join(" ").toLowerCase().includes(term);
    })
    .slice(0, 8);

  return (
    <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
        {selected ? (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-700">
            <PartyLogo name={selected.party} image={selected.partyImage} size={16} />
            {selected.party}
          </span>
        ) : null}
      </div>

      {selected ? (
        <div className="flex items-center gap-3">
          {selected.imageUrl ? (
            <div className="relative h-14 w-14 overflow-hidden rounded-xl bg-muted">
              <Image src={selected.imageUrl} alt={selected.name} fill className="object-cover" sizes="56px" />
            </div>
          ) : (
            <div className="grid h-14 w-14 place-items-center rounded-xl bg-emerald-100 text-sm font-bold text-emerald-800">
              {selected.name.split(" ").map((part) => part[0]).join("").slice(0, 2)}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold text-slate-900">{selected.name}</p>
            <p className="truncate text-sm text-slate-500">
              {selected.position} · {selected.state}
            </p>
            <div className="mt-1.5 flex items-center gap-1.5">
              <PartyLogo name={selected.party} image={selected.partyImage} size={18} />
              <span className="truncate text-xs font-medium text-slate-600">{selected.party}</span>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-sm text-slate-500">Select a candidate below.</p>
      )}

      <Input
        value={search}
        onChange={(event) => onSearch(event.target.value)}
        placeholder="Search candidates..."
        className="bg-white"
      />

      <div className="max-h-40 space-y-1 overflow-y-auto">
        {filtered.map((person) => {
          const active = selected?.id === person.id;
          return (
            <button
              key={person.id}
              type="button"
              onClick={() => onSelect(person.id)}
              className={cn(
                "flex w-full items-center gap-2 rounded-xl border px-2.5 py-2 text-left transition",
                active ? "border-emerald-500 bg-emerald-50" : "border-transparent bg-white hover:border-slate-200"
              )}
            >
              {person.imageUrl ? (
                <div className="relative h-8 w-8 overflow-hidden rounded-lg bg-muted">
                  <Image src={person.imageUrl} alt={person.name} fill className="object-cover" sizes="32px" />
                </div>
              ) : (
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-slate-100 text-[10px] font-semibold text-slate-600">
                  {person.name.split(" ").map((part) => part[0]).join("").slice(0, 2)}
                </span>
              )}
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-slate-900">{person.name}</span>
                <span className="mt-0.5 flex items-center gap-1.5">
                  <PartyLogo name={person.party} image={person.partyImage} size={14} />
                  <span className="truncate text-xs text-slate-500">{person.party}</span>
                </span>
              </span>
            </button>
          );
        })}
        {!filtered.length ? <p className="px-1 text-xs text-slate-500">No matches.</p> : null}
      </div>
    </div>
  );
}

function CompareResults({
  left,
  right,
  metrics,
  summary,
  cardRef
}: {
  left: Politician;
  right: Politician;
  metrics: CompareMetric[];
  summary: { aWins: number; bWins: number; ties: number };
  cardRef: React.Ref<HTMLDivElement>;
}) {
  return (
    <div ref={cardRef} className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 text-slate-900 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/legacy/logo.png" alt="TheChoice9ja" className="h-7 w-7 rounded-lg object-contain" />
          <div>
            <p className="text-[11px] font-bold leading-none text-slate-900">TheChoice9ja</p>
            <p className="mt-0.5 text-[9px] font-medium uppercase tracking-[0.14em] text-emerald-700">Compare</p>
          </div>
        </div>
        <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50">Scorecard</Badge>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {[left, right].map((person, index) => (
          <div key={person.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              {index === 0 ? "Candidate A" : "Candidate B"}
            </p>
            <div className="mt-2 flex items-center gap-2.5">
              {person.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={person.imageUrl} alt={person.name} crossOrigin="anonymous" className="h-10 w-10 rounded-lg object-cover" />
              ) : (
                <span className="grid h-10 w-10 place-items-center rounded-lg bg-emerald-100 text-xs font-bold text-emerald-800">
                  {person.name.split(" ").map((part) => part[0]).join("").slice(0, 2)}
                </span>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{person.name}</p>
                <div className="mt-1 flex items-center gap-1.5">
                  <PartyLogo name={person.party} image={person.partyImage} size={18} />
                  <p className="truncate text-xs text-slate-500">{person.party}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <p className="mt-4 text-sm text-slate-600">
        {left.name} leads in {summary.aWins} · {right.name} leads in {summary.bWins} · {summary.ties} ties
      </p>

      <div className="mt-4 space-y-3">
        {metrics.map((metric) => (
          <div key={metric.key} className="rounded-xl border border-slate-200 p-3">
            <div className="mb-2 flex items-center justify-between gap-3 text-sm">
              <span className="font-medium">{metric.label}</span>
              <span className="text-slate-500">
                {metric.a.toFixed(1)}% vs {metric.b.toFixed(1)}%
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                <div
                  className={cn("h-full rounded-full", metric.leader === "a" ? "bg-emerald-600" : "bg-emerald-600/40")}
                  style={{ width: `${Math.max(0, Math.min(100, metric.a))}%` }}
                />
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                <div
                  className={cn("h-full rounded-full", metric.leader === "b" ? "bg-sky-500" : "bg-sky-500/40")}
                  style={{ width: `${Math.max(0, Math.min(100, metric.b))}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-3">
        <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-emerald-700">thechoice9ja.com</p>
        <p className="text-[10px] text-slate-400">Know your leaders</p>
      </div>
    </div>
  );
}

export function PoliticiansCompareModal({
  open,
  onClose,
  politicians,
  initialLeftId = "",
  initialRightId = ""
}: PoliticiansCompareModalProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [leftId, setLeftId] = useState(initialLeftId);
  const [rightId, setRightId] = useState(initialRightId);
  const [leftSearch, setLeftSearch] = useState("");
  const [rightSearch, setRightSearch] = useState("");
  const [busy, setBusy] = useState<"share" | "download" | "whatsapp" | null>(null);

  useEffect(() => {
    if (!open) return;
    setLeftId(initialLeftId);
    setRightId(initialRightId);
    setLeftSearch("");
    setRightSearch("");
  }, [open, initialLeftId, initialRightId]);

  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  const left = useMemo(() => politicians.find((person) => person.id === leftId) ?? null, [leftId, politicians]);
  const right = useMemo(() => politicians.find((person) => person.id === rightId) ?? null, [rightId, politicians]);
  const canCompare = Boolean(leftId && rightId && leftId !== rightId);

  const needsPartyFallback = useMemo(
    () => politicians.some((person) => person.party && !person.partyImage),
    [politicians]
  );

  const partiesQuery = useQuery({
    queryKey: ["parties", "logos"],
    queryFn: () => getData<ApiRecord[]>(endpoints.parties.list),
    enabled: open && needsPartyFallback,
    staleTime: 5 * 60_000
  });

  const partyLogoByKey = useMemo(() => {
    const map = new Map<string, string>();
    for (const party of asArray<ApiRecord>(partiesQuery.data)) {
      const image = String(party.image ?? "").trim();
      if (!image) continue;
      const keys = [party.acronym, party.slug, party.name]
        .map((value) => String(value ?? "").trim().toLowerCase())
        .filter(Boolean);
      for (const key of keys) map.set(key, image);
    }
    return map;
  }, [partiesQuery.data]);

  const enrichedPoliticians = useMemo(() => {
    return politicians.map((person) => {
      if (person.partyImage) return person;
      const key = person.party.trim().toLowerCase();
      const fallback = partyLogoByKey.get(key);
      return fallback ? { ...person, partyImage: fallback } : person;
    });
  }, [partyLogoByKey, politicians]);

  const compareQuery = useQuery({
    queryKey: ["politicians", "compare-modal", leftId, rightId],
    queryFn: () => politiciansService.compare<CompareResult>(leftId, rightId),
    enabled: open && canCompare,
    retry: false
  });

  const withPartyLogo = (person: Politician | null) => {
    if (!person) return null;
    if (person.partyImage) return person;
    const fallback = partyLogoByKey.get(person.party.trim().toLowerCase());
    return fallback ? { ...person, partyImage: fallback } : person;
  };

  const resultLeft = withPartyLogo(
    compareQuery.data ? normalizePolitician(compareQuery.data.politicianA.politician) : left
  );
  const resultRight = withPartyLogo(
    compareQuery.data ? normalizePolitician(compareQuery.data.politicianB.politician) : right
  );
  const filename = `choice9ja-compare-${Date.now()}.png`;

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
    if (!cardRef.current) throw new Error("Compare card unavailable");
    await waitForImages();
    return toPng(cardRef.current, {
      cacheBust: true,
      pixelRatio: 2,
      backgroundColor: "#ffffff"
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
      gooeyToast.success("Comparison PNG downloaded");
    } catch {
      gooeyToast.error("Could not download comparison");
    } finally {
      setBusy(null);
    }
  }

  async function nativeShare() {
    if (!resultLeft || !resultRight) return;
    try {
      setBusy("share");
      const { file } = await cardAsFile();
      const text = `${resultLeft.name} vs ${resultRight.name} on TheChoice9ja`;

      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ title: "TheChoice9ja Compare", text, files: [file] });
        return;
      }

      if (navigator.share) {
        await navigator.share({ title: "TheChoice9ja Compare", text });
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
    if (!resultLeft || !resultRight) return;
    try {
      setBusy("whatsapp");
      const { file } = await cardAsFile();
      const text = `${resultLeft.name} vs ${resultRight.name} — civic scorecard on TheChoice9ja\n${window.location.origin}/politicians`;

      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ title: "TheChoice9ja Compare", text, files: [file] });
        gooeyToast.success("Pick WhatsApp to send the image");
        return;
      }

      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
      gooeyToast.info("WhatsApp opened — use Save PNG to attach the image");
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") return;
      const text = `${resultLeft.name} vs ${resultRight.name} on TheChoice9ja`;
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
    } finally {
      setBusy(null);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center p-0 sm:items-center sm:p-4">
      <button type="button" aria-label="Close compare modal" className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]" onClick={onClose} />

      <div className="relative z-10 flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-t-3xl border border-slate-200 bg-white shadow-2xl sm:rounded-3xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Compare candidates</h2>
            <p className="mt-1 text-sm text-slate-500">Pick two politicians, review the scorecard, then share the result.</p>
          </div>
          <Button variant="ghost" size="icon" aria-label="Close" className="text-slate-500 hover:bg-slate-100" onClick={onClose}>
            <AppIcon icon={Cancel01Icon} size={18} />
          </Button>
        </div>

        <div className="space-y-5 overflow-y-auto p-5">
          <div className="grid gap-4 md:grid-cols-2">
            <CandidatePick
              label="Candidate A"
              selected={withPartyLogo(left)}
              options={enrichedPoliticians}
              search={leftSearch}
              onSearch={setLeftSearch}
              onSelect={setLeftId}
              excludeId={rightId}
            />
            <CandidatePick
              label="Candidate B"
              selected={withPartyLogo(right)}
              options={enrichedPoliticians}
              search={rightSearch}
              onSearch={setRightSearch}
              onSelect={setRightId}
              excludeId={leftId}
            />
          </div>

          {!canCompare ? (
            <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
              Select two different candidates to compare.
            </p>
          ) : null}

          {canCompare && compareQuery.isLoading ? (
            <p className="text-sm text-slate-500">Loading comparison...</p>
          ) : null}

          {canCompare && compareQuery.isError ? (
            <p className="text-sm text-red-600">
              {compareQuery.error instanceof Error ? compareQuery.error.message : "Could not compare candidates."}
            </p>
          ) : null}

          {canCompare && compareQuery.data && resultLeft && resultRight ? (
            <>
              <CompareResults
                left={resultLeft}
                right={resultRight}
                metrics={compareQuery.data.metrics}
                summary={compareQuery.data.summary}
                cardRef={cardRef}
              />

              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                <Button
                  className="gap-1.5 bg-[#25D366] text-white hover:bg-[#1ebe57]"
                  onClick={shareWhatsApp}
                  disabled={Boolean(busy)}
                >
                  <WhatsAppIcon size={15} />
                  {busy === "whatsapp" ? "..." : "WhatsApp"}
                </Button>
                <Button
                  variant="outline"
                  className="gap-1.5 border-slate-200 bg-white text-slate-800 hover:bg-slate-50"
                  onClick={downloadImage}
                  disabled={Boolean(busy)}
                >
                  <AppIcon icon={Download01Icon} size={15} />
                  {busy === "download" ? "..." : "Save PNG"}
                </Button>
                <Button
                  variant="outline"
                  className="col-span-2 gap-1.5 border-slate-200 bg-white text-slate-800 hover:bg-slate-50 sm:col-span-1"
                  onClick={nativeShare}
                  disabled={Boolean(busy)}
                >
                  <AppIcon icon={Share08Icon} size={15} />
                  {busy === "share" ? "..." : "Share"}
                </Button>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
