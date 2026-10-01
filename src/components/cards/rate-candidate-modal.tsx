"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AppIcon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { ArrowLeft01Icon, Cancel01Icon } from "@/lib/icons";
import { cn } from "@/lib/utils";
import type { RatingCandidate } from "@/types";

type SdgLevel = { rank: number; value: string; color?: string; votes?: number };

type RateCandidateModalProps = {
  open: boolean;
  onClose: () => void;
  candidate: RatingCandidate;
  criteria: Array<[string, SdgLevel[]]>;
  selected: Record<string, number>;
  onToggleLevel: (key: string, rank: number) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  isLoadingCriteria: boolean;
  hasCriteriaError: boolean;
};

/**
 * People answer in words; the API still receives the level's rank, and the
 * rank's own percentage (80%…20%) stays a scoring detail on the server.
 */
const SCALE: Array<{ rank: number; label: string }> = [
  { rank: 5, label: "Excellent" },
  { rank: 4, label: "Good" },
  { rank: 3, label: "Fair" },
  { rank: 2, label: "Poor" },
  { rank: 1, label: "Very poor" }
];

const labelFor = (rank?: number) => SCALE.find((item) => item.rank === rank)?.label;

/** Plain-language names and one-line prompts for each criterion key. */
const CRITERIA_COPY: Record<string, { title: string; prompt: string }> = {
  food_security: { title: "Food security", prompt: "Can families reliably afford and find enough food?" },
  poverty_eradication: { title: "Fighting poverty", prompt: "Are fewer people living in poverty than before?" },
  growth: { title: "Economic growth", prompt: "Is the economy growing in ways people can feel?" },
  job_creation: { title: "Jobs", prompt: "Are there more good jobs, especially for young people?" },
  access_to_capital: { title: "Access to capital", prompt: "Can businesses and individuals get loans and funding?" },
  inclusion: { title: "Inclusion", prompt: "Are women, youth and minorities included in opportunities?" },
  rule_of_law: { title: "Rule of law", prompt: "Are laws applied fairly, including to the powerful?" },
  fighting_corruption: { title: "Fighting corruption", prompt: "Is public money protected and corruption punished?" },
  peace_justice_and_strong_institutions: {
    title: "Peace and justice",
    prompt: "Are communities safe, and do institutions work fairly?"
  },
  zero_hunger: { title: "Hunger", prompt: "Is hunger going down in the areas they serve?" },
  good_health_and_well_being: { title: "Health", prompt: "Can people get affordable, decent healthcare?" },
  quality_education_and_gender_equality: {
    title: "Education and equality",
    prompt: "Are schools improving, with equal chances for girls and boys?"
  },
  clean_water_and_sanitation: { title: "Water and sanitation", prompt: "Do people have clean water and proper sanitation?" },
  affordable_and_clean_energy: { title: "Power and energy", prompt: "Is electricity more reliable and affordable?" },
  decent_work_and_economic_growth: { title: "Decent work", prompt: "Are there fair-paying jobs and a growing local economy?" },
  industry_innovation_and_infrastructure: {
    title: "Infrastructure",
    prompt: "Are roads, industry and new projects being delivered?"
  },
  responsible_consumption_and_production: {
    title: "Responsible resource use",
    prompt: "Are public resources used carefully, without waste?"
  },
  sustainable_cities_and_communities: { title: "Liveable communities", prompt: "Are towns and cities becoming better places to live?" }
};

function copyFor(key: string) {
  return (
    CRITERIA_COPY[key] ?? {
      title: key.replaceAll("_", " ").replace(/^\w/, (char) => char.toUpperCase()),
      prompt: "How well are they doing on this?"
    }
  );
}

/** How long a picked answer stays visible before moving on. */
const ADVANCE_MS = 220;

export function RateCandidateModal({
  open,
  onClose,
  candidate,
  criteria,
  selected,
  onToggleLevel,
  onSubmit,
  isSubmitting,
  isLoadingCriteria,
  hasCriteriaError
}: RateCandidateModalProps) {
  // document does not exist during SSR, so portal only after mount.
  const [mounted, setMounted] = useState(false);
  // 0..n-1 are criteria; n is the review screen.
  const [step, setStep] = useState(0);
  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (open) setStep(0);
  }, [open]);

  const total = criteria.length;
  const onReview = step >= total;
  const current = criteria[Math.min(step, Math.max(total - 1, 0))];
  const answered = Object.keys(selected).length;

  const choose = useCallback(
    (key: string, rank: number) => {
      // onToggleLevel toggles; re-picking the same answer should keep it.
      if (selected[key] !== rank) onToggleLevel(key, rank);
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.setTimeout(() => setStep((value) => Math.min(value + 1, total)), reduceMotion ? 0 : ADVANCE_MS);
    },
    [onToggleLevel, selected, total]
  );

  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
      // Number keys pick an answer: 5 = Excellent … 1 = Very poor.
      if (!onReview && current && /^[1-5]$/.test(event.key)) choose(current[0], Number(event.key));
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose, onReview, current, choose]);

  if (!open || !mounted) return null;

  const firstName = candidate.name.split(" ")[0];

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:p-4">
      <button type="button" aria-label="Close" className="absolute inset-0 bg-black/60 backdrop-blur-[2px] dark:bg-black/70" onClick={onClose} />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Rate ${candidate.name}`}
        className="relative z-10 flex max-h-[92dvh] w-full max-w-[460px] flex-col overflow-hidden rounded-t-2xl border border-border bg-popover dark:border-white/10 sm:rounded-2xl"
      >
        {/* Header: who you're rating, and progress. */}
        <div className="px-5 pb-3 pt-4">
          <div className="flex items-center gap-3">
            {step > 0 ? (
              <button
                type="button"
                onClick={() => setStep((value) => value - 1)}
                aria-label="Previous question"
                className="-ml-2 grid size-9 place-items-center rounded-full transition-colors hover:bg-accent"
              >
                <AppIcon icon={ArrowLeft01Icon} size={20} />
              </button>
            ) : null}
            <span className="relative size-8 shrink-0 overflow-hidden rounded-full bg-secondary">
              {candidate.image ? <Image src={candidate.image} alt="" fill className="object-cover object-top" sizes="32px" /> : null}
            </span>
            <p className="min-w-0 flex-1 truncate text-[15px] font-semibold">Rating {candidate.name}</p>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="-mr-2 grid size-9 place-items-center rounded-full transition-colors hover:bg-accent"
            >
              <AppIcon icon={Cancel01Icon} size={20} />
            </button>
          </div>

          {total ? (
            <div className="mt-4 flex gap-1" aria-hidden>
              {criteria.map(([key], index) => (
                <span
                  key={key}
                  className={cn(
                    "h-1 flex-1 rounded-full transition-colors duration-200 motion-reduce:transition-none",
                    index === step ? "bg-foreground" : selected[key] ? "bg-primary" : "bg-secondary"
                  )}
                />
              ))}
            </div>
          ) : null}
        </div>

        <div className="overflow-y-auto px-5 pb-5">
          {isLoadingCriteria ? (
            <div className="space-y-3 py-6" aria-busy>
              <div className="h-6 w-2/3 animate-pulse rounded bg-secondary" />
              {SCALE.map((item) => (
                <div key={item.rank} className="h-12 animate-pulse rounded-xl bg-secondary" />
              ))}
            </div>
          ) : hasCriteriaError ? (
            <p className="py-8 text-center text-[15px] text-destructive">Couldn’t load the rating questions. Close and try again.</p>
          ) : !total ? (
            <p className="py-8 text-center text-[15px] text-muted-foreground">This candidate isn’t set up for rating yet.</p>
          ) : onReview ? (
            <div className="pt-2">
              <h2 className="text-[22px] font-semibold leading-7 tracking-[-0.01em]">Review your rating</h2>
              <p className="mt-1 text-[15px] text-muted-foreground">
                {answered} of {total} answered. Tap any topic to change it.
              </p>
              <ul className="mt-4 divide-y rounded-xl border">
                {criteria.map(([key], index) => (
                  <li key={key}>
                    <button
                      type="button"
                      onClick={() => setStep(index)}
                      className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-foreground/[0.03]"
                    >
                      <span className="text-[15px]">{copyFor(key).title}</span>
                      <span className={cn("shrink-0 text-[14px]", selected[key] ? "font-semibold" : "text-muted-foreground")}>
                        {labelFor(selected[key]) ?? "Skipped"}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : current ? (
            <div className="pt-2">
              <p className="text-[13px] font-medium text-muted-foreground">
                {step + 1} of {total}
              </p>
              <h2 className="mt-1 text-[22px] font-semibold leading-7 tracking-[-0.01em]">{copyFor(current[0]).title}</h2>
              <p className="mt-1 text-[15px] leading-5 text-muted-foreground">{copyFor(current[0]).prompt}</p>

              <div role="radiogroup" aria-label={`${copyFor(current[0]).title}: how is ${firstName} doing?`} className="mt-5 space-y-2">
                {SCALE.filter((item) => current[1].some((level) => Number(level.rank) === item.rank)).map((item) => {
                  const active = selected[current[0]] === item.rank;
                  return (
                    <button
                      key={item.rank}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      onClick={() => choose(current[0], item.rank)}
                      className={cn(
                        "flex h-12 w-full items-center gap-3 rounded-xl border px-4 text-left text-[15px] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none",
                        active ? "border-foreground bg-foreground/[0.04] font-semibold" : "border-input hover:bg-foreground/[0.03]"
                      )}
                    >
                      <span
                        className={cn(
                          "grid size-5 shrink-0 place-items-center rounded-full border-2 transition-colors",
                          active ? "border-primary" : "border-input"
                        )}
                        aria-hidden
                      >
                        {active ? <span className="size-2.5 rounded-full bg-primary" /> : null}
                      </span>
                      <span className="flex-1">{item.label}</span>
                      <kbd className="hidden text-[12px] font-medium text-muted-foreground sm:inline">{item.rank}</kbd>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>

        {total && !isLoadingCriteria && !hasCriteriaError ? (
          <div className="flex items-center justify-between gap-3 border-t px-5 py-3">
            {onReview ? (
              <>
                <p className="text-[13px] text-muted-foreground">You can rate each candidate once.</p>
                <Button onClick={onSubmit} disabled={!answered || isSubmitting}>
                  {isSubmitting ? "Submitting…" : "Submit rating"}
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" onClick={() => setStep(total)}>
                  Review
                </Button>
                <Button variant="outline" onClick={() => setStep((value) => Math.min(value + 1, total))}>
                  {selected[current?.[0] ?? ""] ? "Next" : "Skip"}
                </Button>
              </>
            )}
          </div>
        ) : null}
      </div>
    </div>,
    document.body
  );
}
