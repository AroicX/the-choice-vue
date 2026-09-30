"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { PostAction } from "@/components/cards/post-card";
import { PollBlock } from "@/components/polls/poll-block";
import { AppIcon } from "@/components/ui/icon";
import { formatRelativeTime } from "@/lib/content-utils";
import { CheckListIcon, Message01Icon, Share08Icon } from "@/lib/icons";
import { cn } from "@/lib/utils";
import { useShareModalStore, type SharePayload } from "@/stores/share-modal-store";
import type { Poll } from "@/types";

export function pollSharePayload(poll: Poll): SharePayload {
  const total = poll.options.reduce((sum, option) => sum + (option.rawValue ?? 0), 0);
  return {
    type: "poll",
    url: `${window.location.origin}/polls/${poll.id}`,
    author: "Choice9ja",
    message: poll.question,
    status: `Poll · ${total.toLocaleString()} ${total === 1 ? "vote" : "votes"}${poll.closed ? " · Final results" : ""}`,
    options: poll.options.map((option) => ({ label: option.label, percent: total ? option.value : undefined }))
  };
}

/**
 * A poll as a timeline row (or bordered card): room context, question, the
 * inline poll, and share. Tapping the row outside the options opens the poll.
 */
export function PollCard({ poll, variant = "card" }: { poll: Poll; variant?: "timeline" | "card" }) {
  const router = useRouter();
  const openShareModal = useShareModalStore((state) => state.open);
  const time = formatRelativeTime(poll.createdAt);

  return (
    <article
      onClick={() => {
        if (window.getSelection()?.toString()) return;
        router.push(`/polls/${poll.id}`);
      }}
      className={cn(
        "flex cursor-pointer gap-3 px-4 py-3 transition-colors hover:bg-foreground/[0.02]",
        variant === "timeline" ? "border-b" : "rounded-xl border"
      )}
    >
      <span className="grid size-10 shrink-0 place-items-center rounded-full bg-secondary" aria-hidden>
        <AppIcon icon={CheckListIcon} size={20} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="flex min-w-0 items-center gap-1 text-[13px] text-muted-foreground">
          <span className="font-semibold text-foreground">Poll</span>
          {poll.topic && poll.discussionId ? (
            <>
              <span aria-hidden>·</span>
              <Link
                href={`/discussions/${poll.discussionId}`}
                onClick={(event) => event.stopPropagation()}
                className="truncate hover:underline"
              >
                {poll.topic}
              </Link>
            </>
          ) : null}
          {time ? (
            <>
              <span aria-hidden>·</span>
              <Link href={`/polls/${poll.id}`} onClick={(event) => event.stopPropagation()} className="shrink-0 hover:underline">
                {time}
              </Link>
            </>
          ) : null}
        </p>
        <p className="mb-3 mt-0.5 text-[15px] font-medium leading-5">{poll.question}</p>
        <PollBlock poll={poll} />
        <div className="-ml-2 mt-1 flex" onClick={(event) => event.stopPropagation()}>
          {poll.discussionId ? (
            <PostAction
              icon={Message01Icon}
              label="Discuss in the room"
              tone="primary"
              onClick={() => router.push(`/discussions/${poll.discussionId}`)}
            />
          ) : null}
          <PostAction icon={Share08Icon} label="Share poll" tone="sky" onClick={() => openShareModal(pollSharePayload(poll))} />
        </div>
      </div>
    </article>
  );
}
