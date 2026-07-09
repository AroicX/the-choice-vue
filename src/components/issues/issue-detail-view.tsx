"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { gooeyToast } from "goey-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DetailSkeleton } from "@/components/skeletons/card-skeletons";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { normalizeIssue } from "@/lib/content-utils";
import { issuesService } from "@/services/civic-content.service";
import type { ApiRecord } from "@/types";

export function IssueDetailView({ issueId }: { issueId: string }) {
  const queryClient = useQueryClient();
  const { requireAuth } = useRequireAuth();
  const [upvoted, setUpvoted] = useState(false);

  const query = useQuery({
    queryKey: ["issue", issueId],
    queryFn: () => issuesService.detail<ApiRecord>(issueId),
    retry: false
  });

  const upvoteMutation = useMutation({
    mutationFn: () => issuesService.upvote(issueId),
    onSuccess: () => {
      setUpvoted(true);
      gooeyToast.success("Issue upvoted");
      queryClient.invalidateQueries({ queryKey: ["issue", issueId] });
    },
    onError: (error) => {
      gooeyToast.error("Could not upvote", {
        description: error instanceof Error ? error.message : "Try again."
      });
    }
  });

  const issue = query.data ? normalizeIssue(query.data) : null;

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <Link href="/issues" className="text-sm font-medium text-primary hover:underline">
        ← Back to issues
      </Link>

      {query.isLoading ? <DetailSkeleton /> : null}
      {query.isError ? (
        <Card>
          <CardContent className="p-5 text-destructive">
            {query.error instanceof Error ? query.error.message : "Could not load issue."}
          </CardContent>
        </Card>
      ) : null}

      {issue ? (
        <>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">{issue.status.replaceAll("_", " ")}</Badge>
                <Badge variant="outline">{issue.priority} priority</Badge>
                <Badge variant="outline">{issue.category}</Badge>
              </div>
              <h1 className="mt-3 text-2xl font-bold tracking-tight">{issue.title}</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                {issue.location}
                {issue.createdByName ? ` · Reported by ${issue.createdByName}` : ""}
                {issue.createdAt ? ` · ${new Date(issue.createdAt).toLocaleDateString()}` : ""}
              </p>
            </div>
            <Button
              disabled={upvoted || upvoteMutation.isPending}
              onClick={() => {
                if (!requireAuth("Sign in to upvote this issue.")) return;
                upvoteMutation.mutate();
              }}
            >
              {upvoted ? "Upvoted" : upvoteMutation.isPending ? "Upvoting..." : `Upvote · ${issue.upvotes.toLocaleString()}`}
            </Button>
          </div>

          <Card>
            <CardContent className="space-y-3 p-5">
              <h2 className="font-semibold">Description</h2>
              <p className="whitespace-pre-line text-sm leading-7 text-muted-foreground">{issue.description}</p>
            </CardContent>
          </Card>

          {issue.aiSummary ? (
            <Card>
              <CardContent className="space-y-2 p-5">
                <h2 className="font-semibold">AI summary</h2>
                <p className="text-sm leading-7 text-muted-foreground">{issue.aiSummary}</p>
              </CardContent>
            </Card>
          ) : null}

          <div className="grid gap-3 sm:grid-cols-3">
            {[
              ["Upvotes", issue.upvotes.toLocaleString()],
              ["Comments", issue.comments.toLocaleString()],
              ["Type", issue.type || "—"]
            ].map(([label, value]) => (
              <Card key={label}>
                <CardContent className="p-4">
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="mt-1 text-lg font-semibold">{value}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {issue.politicianId ? (
            <Card>
              <CardContent className="flex items-center gap-3 p-5">
                {issue.politicianImage ? (
                  <div className="relative h-14 w-14 overflow-hidden rounded-xl bg-muted">
                    <Image src={issue.politicianImage} alt={issue.politicianName ?? "Politician"} fill className="object-cover" sizes="56px" />
                  </div>
                ) : null}
                <div className="min-w-0 flex-1">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Assigned politician</p>
                  <p className="font-semibold">{issue.politicianName ?? "Politician"}</p>
                </div>
                <Button asChild variant="outline" size="sm">
                  <Link href={`/politicians/${issue.politicianId}`}>View profile</Link>
                </Button>
              </CardContent>
            </Card>
          ) : null}

          {(issue.evidencePhotos?.length || issue.evidenceDocuments?.length) ? (
            <Card>
              <CardContent className="space-y-4 p-5">
                <h2 className="font-semibold">Evidence</h2>
                {issue.evidencePhotos?.length ? (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {issue.evidencePhotos.map((photo) => (
                      <div key={photo} className="relative h-40 overflow-hidden rounded-xl bg-muted">
                        <Image src={photo} alt="Evidence" fill className="object-cover" sizes="(max-width:768px) 100vw, 50vw" />
                      </div>
                    ))}
                  </div>
                ) : null}
                {issue.evidenceDocuments?.length ? (
                  <ul className="space-y-2">
                    {issue.evidenceDocuments.map((doc) => (
                      <li key={doc}>
                        <a href={doc} target="_blank" rel="noreferrer" className="break-all text-sm text-primary hover:underline">
                          {doc}
                        </a>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </CardContent>
            </Card>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
