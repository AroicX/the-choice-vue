"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { gooeyToast } from "goey-toast";
import { IssueCard } from "@/components/cards/issue-card";
import { RoomCover } from "@/components/discourse/room-cover";
import { PostRowSkeleton } from "@/components/skeletons/card-skeletons";
import { TimelineEmpty } from "@/components/timeline/timeline";
import { Button } from "@/components/ui/button";
import { AppIcon } from "@/components/ui/icon";
import { Skeleton } from "@/components/ui/skeleton";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { asArray, normalizeCommunity, normalizeIssue } from "@/lib/content-utils";
import { ArrowLeft01Icon } from "@/lib/icons";
import { communitiesService, issuesService } from "@/services/civic-content.service";
import { useAuthStore } from "@/stores/auth-store";
import type { ApiRecord } from "@/types";

const TYPE_LABEL: Record<string, string> = {
  STATE: "State",
  LGA: "Local government",
  WARD: "Ward",
  CONSTITUENCY: "Constituency",
  TOPIC: "Topic",
  POLITICAL_PARTY: "Political party",
  CIVIL_SOCIETY: "Civil society"
};

export function CommunityDetailView({ communityId }: { communityId: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const userId = useAuthStore((state) => state.user?.id);
  const { requireAuth } = useRequireAuth();
  const [membership, setMembership] = useState<{ isMember: boolean; count: number } | null>(null);

  const query = useQuery({
    queryKey: ["community", communityId, userId ?? null],
    queryFn: () => communitiesService.detail<ApiRecord>(communityId),
    retry: false
  });
  const community = query.data ? normalizeCommunity(query.data) : null;
  const isMember = membership?.isMember ?? Boolean(community?.isMember);
  const members = membership?.count ?? community?.memberCount ?? 0;

  // Place-based communities show the issues reported there.
  const issuesQuery = useQuery({
    queryKey: ["issues", "community", community?.state ?? null],
    queryFn: () => issuesService.list<ApiRecord>({ state: community!.state, sort: "top", take: 20 }),
    enabled: Boolean(community?.state)
  });
  const issues = asArray<ApiRecord>(issuesQuery.data).map(normalizeIssue);

  const toggle = useMutation({
    mutationFn: () => (isMember ? communitiesService.leave(communityId) : communitiesService.join(communityId)),
    onMutate: () => setMembership({ isMember: !isMember, count: Math.max(0, members + (isMember ? -1 : 1)) }),
    onSuccess: () => {
      gooeyToast.success(isMember ? "You joined" : "You left");
      queryClient.invalidateQueries({ queryKey: ["community", communityId] });
    },
    onError: (error) => {
      setMembership(null);
      gooeyToast.error("Couldn’t update your membership", { description: error instanceof Error ? error.message : "Try again." });
    }
  });

  const place = community ? [community.lga, community.state].filter(Boolean).join(", ") : "";

  return (
    <>
      <div className="sticky top-[53px] z-20 flex h-[53px] items-center gap-6 bg-background/85 px-2 backdrop-blur-md lg:top-0">
        <button
          type="button"
          onClick={() => (window.history.length > 1 ? router.back() : router.push("/communities"))}
          aria-label="Back"
          className="grid size-9 place-items-center rounded-full transition-colors hover:bg-accent"
        >
          <AppIcon icon={ArrowLeft01Icon} size={20} />
        </button>
        <div className="min-w-0">
          <p className="truncate text-[17px] font-bold leading-5">{community?.name ?? "Community"}</p>
          {community ? (
            <p className="text-[13px] text-muted-foreground">
              {members.toLocaleString()} {members === 1 ? "member" : "members"}
            </p>
          ) : null}
        </div>
      </div>

      {query.isLoading ? (
        <div aria-busy>
          <Skeleton className="aspect-[3/1] w-full rounded-none" />
          <div className="space-y-2 px-4 pt-3">
            <Skeleton className="h-7 w-2/3" />
            <Skeleton className="h-4 w-full" />
          </div>
        </div>
      ) : query.isError || !community ? (
        <TimelineEmpty title="Community not found" body="It may have been removed, or the link is wrong." href="/communities" action="See communities" />
      ) : (
        <>
          <RoomCover seed={community.id} text={`${community.name} ${community.description}`} className="aspect-[3/1] w-full" />
          <section className="border-b px-4 pb-4 pt-3">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h1 className="text-xl font-bold leading-6 tracking-tight">{community.name}</h1>
                <p className="mt-0.5 text-[14px] text-muted-foreground">
                  {[TYPE_LABEL[community.type] ?? community.type, place && place !== community.name ? place : null]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              </div>
              {isMember ? (
                <Button
                  variant="outline"
                  className="shrink-0"
                  disabled={toggle.isPending}
                  onClick={() => {
                    if (window.confirm(`Leave ${community.name}?`)) toggle.mutate();
                  }}
                >
                  Joined
                </Button>
              ) : (
                <Button
                  variant="inverted"
                  className="shrink-0"
                  disabled={toggle.isPending}
                  onClick={() => {
                    if (!requireAuth("Sign in to join this community.")) return;
                    toggle.mutate();
                  }}
                >
                  Join
                </Button>
              )}
            </div>
            {community.description ? <p className="mt-3 text-[15px] leading-6">{community.description}</p> : null}
            <p className="mt-3 text-[14px] text-muted-foreground">
              <strong className="font-bold text-foreground">{members.toLocaleString()}</strong> {members === 1 ? "member" : "members"}
            </p>
          </section>

          {community.state ? (
            <section aria-labelledby="community-issues">
              <h2 id="community-issues" className="border-b px-4 py-3 text-lg font-bold tracking-tight">
                Issues in {community.state}
              </h2>
              {issuesQuery.isLoading ? (
                Array.from({ length: 3 }).map((_, index) => <PostRowSkeleton key={index} />)
              ) : issues.length ? (
                issues.map((issue) => <IssueCard key={issue.id} issue={issue} />)
              ) : (
                <TimelineEmpty
                  title="No issues reported here yet"
                  body={`Seen a problem in ${community.state}? Report it so others can back it.`}
                  href="/issues/create"
                  action="Report an issue"
                />
              )}
            </section>
          ) : null}
        </>
      )}
    </>
  );
}
