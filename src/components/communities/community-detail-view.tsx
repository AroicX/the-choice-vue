"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { gooeyToast } from "goey-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DetailSkeleton } from "@/components/skeletons/card-skeletons";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { normalizeCommunity } from "@/lib/content-utils";
import { communitiesService } from "@/services/civic-content.service";
import type { ApiRecord } from "@/types";

export function CommunityDetailView({ communityId }: { communityId: string }) {
  const queryClient = useQueryClient();
  const { requireAuth } = useRequireAuth();
  const [joined, setJoined] = useState(false);

  const query = useQuery({
    queryKey: ["community", communityId],
    queryFn: () => communitiesService.detail<ApiRecord>(communityId),
    retry: false
  });

  const joinMutation = useMutation({
    mutationFn: () => communitiesService.join(communityId),
    onSuccess: () => {
      setJoined(true);
      gooeyToast.success("Joined community");
      queryClient.invalidateQueries({ queryKey: ["community", communityId] });
    },
    onError: (error) => {
      gooeyToast.error("Could not join", {
        description: error instanceof Error ? error.message : "Try again."
      });
    }
  });

  const leaveMutation = useMutation({
    mutationFn: () => communitiesService.leave(communityId),
    onSuccess: () => {
      setJoined(false);
      gooeyToast.success("Left community");
      queryClient.invalidateQueries({ queryKey: ["community", communityId] });
    },
    onError: (error) => {
      gooeyToast.error("Could not leave", {
        description: error instanceof Error ? error.message : "Try again."
      });
    }
  });

  const community = query.data ? normalizeCommunity(query.data) : null;

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <Link href="/communities" className="text-sm font-medium text-primary hover:underline">
        ← Back to communities
      </Link>

      {query.isLoading ? <DetailSkeleton /> : null}
      {query.isError ? (
        <Card>
          <CardContent className="p-5 text-destructive">
            {query.error instanceof Error ? query.error.message : "Could not load community."}
          </CardContent>
        </Card>
      ) : null}

      {community ? (
        <>
          <Card>
            <CardContent className="space-y-5 p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-2xl font-bold tracking-tight">{community.name}</h1>
                    <Badge variant="secondary">{community.type}</Badge>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {[community.lga, community.state].filter(Boolean).join(", ") || "Nigeria"}
                    {community.slug ? ` · /${community.slug}` : ""}
                  </p>
                </div>
                {joined ? (
                  <Button
                    variant="outline"
                    disabled={leaveMutation.isPending}
                    onClick={() => {
                      if (!requireAuth("Sign in to leave this community.")) return;
                      leaveMutation.mutate();
                    }}
                  >
                    {leaveMutation.isPending ? "Leaving..." : "Leave"}
                  </Button>
                ) : (
                  <Button
                    disabled={joinMutation.isPending}
                    onClick={() => {
                      if (!requireAuth("Sign in to join this community.")) return;
                      joinMutation.mutate();
                    }}
                  >
                    {joinMutation.isPending ? "Joining..." : "Join community"}
                  </Button>
                )}
              </div>

              <p className="text-sm leading-7 text-muted-foreground">
                {community.description || "No description provided for this community."}
              </p>

              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  ["Type", community.type],
                  ["State", community.state || "—"],
                  ["LGA", community.lga || "—"],
                  ["Created", community.createdAt ? new Date(community.createdAt).toLocaleDateString() : "—"]
                ].map(([label, value]) => (
                  <div key={label} className="rounded-xl border p-3">
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className="mt-1 text-sm font-semibold">{value}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-3 p-5">
              <h2 className="font-semibold">What you can do here</h2>
              <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
                <li>Follow local civic updates tied to this community.</li>
                <li>Join discussions and track issues in your area.</li>
                <li>Connect with verified organizations and citizens.</li>
              </ul>
              <div className="flex flex-wrap gap-2 pt-2">
                <Button asChild variant="outline" size="sm">
                  <Link href="/discussions">Browse discussions</Link>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link href="/issues">Browse issues</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  );
}
