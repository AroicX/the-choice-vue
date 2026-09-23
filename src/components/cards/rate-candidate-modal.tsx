"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AppIcon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { Cancel01Icon } from "@/lib/icons";
import { ratingOfficeLabel } from "@/lib/content-utils";
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

function formatCriterion(key: string) {
  return key.replaceAll("_", " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

/**
 * The rating form lives in a modal rather than inside the card: the cards sit in
 * a CSS grid, so expanding one stretched every sibling in the same row.
 *
 * It renders through a portal because the card clips overflow AND `.surface-card`
 * applies `hover:-translate-y-0.5`. A transformed ancestor becomes the containing
 * block for `position: fixed`, so without the portal the overlay was clipped by
 * the card and jumped between viewport- and card-relative as the hover toggled.
 */
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
  useEffect(() => setMounted(true), []);

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

  if (!open || !mounted) return null;

  const selectedCount = Object.keys(selected).length;
  const total = criteria.length;
  const canSubmit = selectedCount > 0 && !isSubmitting;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-end justify-center p-0 sm:items-center sm:p-4">
      <button
        type="button"
        aria-label="Close rating"
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Rate ${candidate.name}`}
        className="relative z-10 flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl border border-border bg-background shadow-2xl sm:rounded-3xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-border/70 px-5 py-4">
          <div className="min-w-0">
            <h2 className="truncate text-lg font-semibold">Rate {candidate.name}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {ratingOfficeLabel(candidate.position)}
              {candidate.party ? ` · ${candidate.party}` : ""}
            </p>
          </div>
          <Button variant="ghost" size="icon" aria-label="Close" onClick={onClose}>
            <AppIcon icon={Cancel01Icon} size={18} />
          </Button>
        </div>

        <div className="space-y-5 overflow-y-auto p-5">
          <p className="text-sm text-muted-foreground">
            Select a score for each criterion, then submit. You can only rate a candidate once.
          </p>

          {isLoadingCriteria ? (
            <p className="text-sm text-muted-foreground">Loading criteria...</p>
          ) : null}
          {hasCriteriaError ? (
            <p className="text-sm text-destructive">Could not load rating criteria.</p>
          ) : null}
          {!criteria.length && !isLoadingCriteria ? (
            <p className="text-sm text-muted-foreground">
              This candidate isn&apos;t set up for rating yet.
            </p>
          ) : null}

          {criteria.map(([key, levels]) => (
            <div key={key} className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium">{formatCriterion(key)}</p>
                {selected[key] ? (
                  <span className="text-xs text-muted-foreground">Selected</span>
                ) : null}
              </div>
              <div className="flex flex-wrap gap-2">
                {[...levels]
                  .sort((a, b) => b.rank - a.rank)
                  .map((level) => {
                    const active = selected[key] === level.rank;
                    return (
                      <button
                        key={`${key}-${level.rank}`}
                        type="button"
                        aria-pressed={active}
                        onClick={() => onToggleLevel(key, level.rank)}
                        className={cn(
                          "rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition",
                          active
                            ? "border-primary bg-primary text-primary-foreground"
                            : "hover:border-primary/40"
                        )}
                        style={!active && level.color ? { borderColor: level.color } : undefined}
                      >
                        {level.value}
                      </button>
                    );
                  })}
              </div>
            </div>
          ))}
        </div>

        {/* Pinned so the action stays reachable however long the criteria list is. */}
        {criteria.length ? (
          <div className="flex items-center justify-between gap-3 border-t border-border/70 px-5 py-4">
            <p className="text-xs text-muted-foreground">
              {selectedCount} of {total} selected
            </p>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={onClose}>
                Cancel
              </Button>
              <Button size="sm" disabled={!canSubmit} onClick={onSubmit}>
                {isSubmitting ? "Submitting..." : "Submit rating"}
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </div>,
    document.body
  );
}
