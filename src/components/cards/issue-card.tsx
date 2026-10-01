"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { PostAction } from "@/components/cards/post-card";
import { IssueStatusPill, issueStatusLabel } from "@/components/issues/issue-status";
import { AppIcon } from "@/components/ui/icon";
import { useIssueUpvote } from "@/hooks/use-issue-upvote";
import { formatRelativeTime } from "@/lib/content-utils";
import { ArrowUp01Icon, Location01Icon, Share08Icon } from "@/lib/icons";
import { cn } from "@/lib/utils";
import { useShareModalStore, type SharePayload } from "@/stores/share-modal-store";
import type { Issue } from "@/types";

export function issueSharePayload(issue: Issue): SharePayload {
  return {
    type: "issue",
    url: `${window.location.origin}/issues/${issue.id}`,
    author: "Choice9ja",
    message: issue.title,
    status: `Issue · ${issueStatusLabel(issue.status)} · ${issue.location}`
  };
}

/** Upvote toggle: arrow fills and the count turns green when it's yours. */
export function UpvoteButton({ issue, size = "sm" }: { issue: Issue; size?: "sm" | "lg" }) {
  const { upvoted, count, toggle, isPending } = useIssueUpvote(issue);
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.94 }}
      aria-pressed={upvoted}
      aria-label={upvoted ? "Remove your upvote" : "Upvote this issue"}
      disabled={isPending}
      onClick={(event) => {
        event.stopPropagation();
        toggle();
      }}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-semibold tabular-nums transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        size === "lg" ? "h-10 px-5 text-sm" : "h-8 px-3 text-[13px]",
        upvoted ? "border-primary bg-primary/10 text-primary" : "border-input hover:bg-foreground/[0.04]"
      )}
    >
      <AppIcon icon={ArrowUp01Icon} size={size === "lg" ? 18 : 16} strokeWidth={upvoted ? 2.5 : 1.75} />
      {count.toLocaleString()}
    </motion.button>
  );
}

/** Issue as a timeline row: context, title, description, first photo, status, upvote, share. */
export function IssueCard({ issue, variant = "timeline" }: { issue: Issue; variant?: "timeline" | "card" }) {
  const router = useRouter();
  const openShareModal = useShareModalStore((state) => state.open);
  const photo = issue.evidencePhotos?.[0];
  const time = formatRelativeTime(issue.createdAt);

  return (
    <article
      onClick={() => {
        if (window.getSelection()?.toString()) return;
        router.push(`/issues/${issue.id}`);
      }}
      className={cn(
        "flex cursor-pointer gap-3 px-4 py-3 transition-colors hover:bg-foreground/[0.02]",
        variant === "timeline" ? "border-b" : "rounded-xl border"
      )}
    >
      <div className="min-w-0 flex-1">
        <p className="flex min-w-0 items-center gap-1 text-[13px] text-muted-foreground">
          <span className="truncate font-semibold text-foreground">{issue.category}</span>
          <span aria-hidden>·</span>
          <AppIcon icon={Location01Icon} size={13} className="shrink-0" />
          <span className="truncate">{issue.location}</span>
          {time ? (
            <>
              <span aria-hidden>·</span>
              <Link href={`/issues/${issue.id}`} onClick={(event) => event.stopPropagation()} className="shrink-0 hover:underline">
                {time}
              </Link>
            </>
          ) : null}
        </p>
        <div className="mt-1 flex gap-3">
          <div className="min-w-0 flex-1">
            <h2 className="text-[16px] font-bold leading-5">{issue.title}</h2>
            {issue.description ? (
              <p className="mt-1 line-clamp-2 text-[15px] leading-5 text-muted-foreground">{issue.description}</p>
            ) : null}
          </div>
          {photo ? (
            <span className="relative size-[72px] shrink-0 overflow-hidden rounded-lg bg-secondary">
              <Image src={photo} alt="" fill className="object-cover" sizes="72px" />
            </span>
          ) : null}
        </div>
        <div className="mt-3 flex items-center gap-2" onClick={(event) => event.stopPropagation()}>
          <IssueStatusPill status={issue.status} />
          <UpvoteButton issue={issue} />
          <div className="ml-auto">
            <PostAction icon={Share08Icon} label="Share issue" tone="sky" onClick={() => openShareModal(issueSharePayload(issue))} />
          </div>
        </div>
      </div>
    </article>
  );
}
