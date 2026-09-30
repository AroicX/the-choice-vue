"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { pollSharePayload } from "@/components/cards/poll-card";
import { PollBlock } from "@/components/polls/poll-block";
import { TimelineEmpty } from "@/components/timeline/timeline";
import { Button } from "@/components/ui/button";
import { AppIcon } from "@/components/ui/icon";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate, normalizePoll } from "@/lib/content-utils";
import { ArrowLeft01Icon, Message01Icon, Share08Icon } from "@/lib/icons";
import { getData } from "@/services/client/api";
import { endpoints } from "@/services/client/endpoints";
import { useAuthStore } from "@/stores/auth-store";
import { useShareModalStore } from "@/stores/share-modal-store";
import type { ApiRecord } from "@/types";

export function PollDetailView({ pollId }: { pollId: string }) {
  const router = useRouter();
  const userId = useAuthStore((state) => state.user?.id);
  const openShareModal = useShareModalStore((state) => state.open);
  const query = useQuery({
    queryKey: ["poll", pollId, userId ?? null],
    queryFn: () => getData<ApiRecord>(endpoints.polls.detail(pollId)),
    retry: false
  });
  const poll = query.data ? normalizePoll(query.data) : null;

  return (
    <>
      <div className="sticky top-[53px] z-20 flex h-[53px] items-center gap-6 bg-background/85 px-2 backdrop-blur-md lg:top-0">
        <button
          type="button"
          onClick={() => (window.history.length > 1 ? router.back() : router.push("/polls"))}
          aria-label="Back"
          className="grid size-9 place-items-center rounded-full transition-colors hover:bg-accent"
        >
          <AppIcon icon={ArrowLeft01Icon} size={20} />
        </button>
        <h1 className="text-xl font-bold tracking-tight">Poll</h1>
      </div>

      {query.isLoading ? (
        <div className="space-y-3 px-4 pt-3" aria-busy>
          <Skeleton className="h-3.5 w-1/3" />
          <Skeleton className="h-7 w-4/5" />
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-11 w-full rounded-md" />
          ))}
        </div>
      ) : query.isError || !poll ? (
        <TimelineEmpty title="Poll not found" body="It may have been removed, or the link is wrong." href="/polls" action="See polls" />
      ) : (
        <article className="px-4 pb-6 pt-3">
          {poll.topic && poll.discussionId ? (
            <Link href={`/discussions/${poll.discussionId}`} className="text-[13px] text-muted-foreground hover:underline">
              In {poll.topic}
            </Link>
          ) : null}
          <h2 className="mb-5 mt-1 text-[22px] font-bold leading-7 tracking-[-0.01em]">{poll.question}</h2>
          <PollBlock poll={poll} size="large" />
          {poll.createdAt ? <p className="mt-4 text-[13px] text-muted-foreground">Asked {formatDate(poll.createdAt)}</p> : null}

          <div className="mt-5 flex flex-wrap gap-2 border-t pt-4">
            <Button variant="outline" onClick={() => openShareModal(pollSharePayload(poll))}>
              <AppIcon icon={Share08Icon} size={16} />
              Share
            </Button>
            {poll.discussionId ? (
              <Button variant="outline" asChild>
                <Link href={`/discussions/${poll.discussionId}`}>
                  <AppIcon icon={Message01Icon} size={16} />
                  Discuss in the room
                </Link>
              </Button>
            ) : null}
          </div>
        </article>
      )}
    </>
  );
}
