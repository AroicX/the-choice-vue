"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { gooeyToast } from "goey-toast";
import { UpvoteButton, issueSharePayload } from "@/components/cards/issue-card";
import { IssueStatusPill } from "@/components/issues/issue-status";
import { TimelineEmpty } from "@/components/timeline/timeline";
import { Button } from "@/components/ui/button";
import { AppIcon } from "@/components/ui/icon";
import { Skeleton } from "@/components/ui/skeleton";
import { formatRelativeTime, normalizeIssue } from "@/lib/content-utils";
import { ArrowLeft01Icon, Delete02Icon, Location01Icon, Share08Icon } from "@/lib/icons";
import { issuesService } from "@/services/civic-content.service";
import { useAuthStore } from "@/stores/auth-store";
import { useShareModalStore } from "@/stores/share-modal-store";
import type { ApiRecord } from "@/types";

const STAFF = ["ADMIN", "SUPER_ADMIN", "MODERATOR"];

export function IssueDetailView({ issueId }: { issueId: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const openShareModal = useShareModalStore((state) => state.open);

  const query = useQuery({
    queryKey: ["issue", issueId, user?.id ?? null],
    queryFn: () => issuesService.detail<ApiRecord>(issueId),
    retry: false
  });
  const issue = query.data ? normalizeIssue(query.data) : null;
  const canDelete = Boolean(user && issue && (issue.createdById === user.id || STAFF.includes(user.role)));

  const remove = useMutation({
    mutationFn: () => issuesService.remove(issueId),
    onSuccess: () => {
      gooeyToast.success("Issue deleted");
      queryClient.invalidateQueries({ queryKey: ["issues"] });
      router.replace("/issues");
    },
    onError: (error) => gooeyToast.error("Couldn’t delete the issue", { description: error instanceof Error ? error.message : "Try again." })
  });

  return (
    <>
      <div className="sticky top-[53px] z-20 flex h-[53px] items-center gap-6 bg-background/85 px-2 backdrop-blur-md lg:top-0">
        <button
          type="button"
          onClick={() => (window.history.length > 1 ? router.back() : router.push("/issues"))}
          aria-label="Back"
          className="grid size-9 place-items-center rounded-full transition-colors hover:bg-accent"
        >
          <AppIcon icon={ArrowLeft01Icon} size={20} />
        </button>
        <h1 className="text-xl font-bold tracking-tight">Issue</h1>
      </div>

      {query.isLoading ? (
        <div className="space-y-3 px-4 pt-3" aria-busy>
          <Skeleton className="h-5 w-24 rounded-full" />
          <Skeleton className="h-7 w-4/5" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      ) : query.isError || !issue ? (
        <TimelineEmpty title="Issue not found" body="It may have been removed, or the link is wrong." href="/issues" action="See issues" />
      ) : (
        <article className="px-4 pb-8 pt-3">
          <div className="flex flex-wrap items-center gap-2 text-[13px] text-muted-foreground">
            <IssueStatusPill status={issue.status} />
            <span className="font-semibold text-foreground">{issue.category}</span>
            <span aria-hidden>·</span>
            <span className="inline-flex items-center gap-1">
              <AppIcon icon={Location01Icon} size={13} />
              {issue.location}
            </span>
          </div>

          <h2 className="mt-3 text-[24px] font-bold leading-7 tracking-[-0.01em]">{issue.title}</h2>

          <div className="mt-3 flex items-center gap-2.5 text-[14px]">
            {issue.createdByAvatar ? (
              <Image src={issue.createdByAvatar} alt="" width={28} height={28} className="size-7 rounded-full object-cover" />
            ) : (
              <span className="grid size-7 place-items-center rounded-full bg-secondary text-[12px] font-bold" aria-hidden>
                {(issue.createdByName ?? "C").charAt(0)}
              </span>
            )}
            <span className="text-muted-foreground">
              Reported by{" "}
              {issue.createdByUsername ? (
                <Link href={`/u/${issue.createdByUsername}`} className="font-semibold text-foreground hover:underline">
                  {issue.createdByName ?? issue.createdByUsername}
                </Link>
              ) : (
                <span className="font-semibold text-foreground">{issue.createdByName ?? "a citizen"}</span>
              )}
              {issue.createdAt ? ` · ${formatRelativeTime(issue.createdAt)}` : ""}
            </span>
          </div>

          {issue.description ? <p className="mt-4 whitespace-pre-line text-[16px] leading-6">{issue.description}</p> : null}

          {issue.evidencePhotos?.length ? (
            <section className="mt-5">
              <h3 className="mb-2 text-[15px] font-bold">Evidence</h3>
              <div className={issue.evidencePhotos.length === 1 ? "grid" : "grid grid-cols-2 gap-1.5"}>
                {issue.evidencePhotos.map((photo) => (
                  <a
                    key={photo}
                    href={photo}
                    target="_blank"
                    rel="noreferrer"
                    className="relative block aspect-[4/3] overflow-hidden rounded-xl bg-secondary"
                  >
                    <Image src={photo} alt="Evidence photo" fill className="object-cover" sizes="(max-width:768px) 100vw, 330px" />
                  </a>
                ))}
              </div>
            </section>
          ) : null}

          {issue.politicianId ? (
            <Link
              href={`/politicians/${issue.politicianId}`}
              className="mt-5 flex items-center gap-3 rounded-xl border p-3 transition-colors hover:bg-foreground/[0.02]"
            >
              <span className="relative size-11 shrink-0 overflow-hidden rounded-full bg-secondary">
                {issue.politicianImage ? <Image src={issue.politicianImage} alt="" fill className="object-cover object-top" sizes="44px" /> : null}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[13px] text-muted-foreground">Responsible leader</span>
                <span className="block truncate text-[15px] font-bold">{issue.politicianName ?? "View profile"}</span>
              </span>
              <span className="text-[14px] font-medium">View profile</span>
            </Link>
          ) : null}

          <div className="mt-6 flex flex-wrap items-center gap-2 border-t pt-4">
            <UpvoteButton issue={issue} size="lg" />
            <Button variant="outline" onClick={() => openShareModal(issueSharePayload(issue))}>
              <AppIcon icon={Share08Icon} size={16} />
              Share
            </Button>
            {canDelete ? (
              <Button
                variant="ghost"
                className="ml-auto text-destructive hover:bg-destructive/10 hover:text-destructive"
                disabled={remove.isPending}
                onClick={() => {
                  if (window.confirm("Delete this issue? This can’t be undone.")) remove.mutate();
                }}
              >
                <AppIcon icon={Delete02Icon} size={16} />
                {remove.isPending ? "Deleting…" : "Delete"}
              </Button>
            ) : null}
          </div>
          <p className="mt-2 text-[13px] text-muted-foreground">Upvote to show this matters to you. More upvotes push it up the Top list.</p>
        </article>
      )}
    </>
  );
}
