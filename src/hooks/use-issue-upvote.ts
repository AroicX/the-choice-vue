"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { gooeyToast } from "goey-toast";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { issuesService } from "@/services/civic-content.service";
import type { Issue } from "@/types";

/**
 * One-upvote-per-person toggle with an optimistic count. The server answers
 * { upvoted, upvoteCount }, which then becomes the source of truth.
 */
export function useIssueUpvote(issue: Issue) {
  const queryClient = useQueryClient();
  const { requireAuth } = useRequireAuth();
  const [state, setState] = useState<{ upvoted: boolean; count: number } | null>(null);
  const upvoted = state?.upvoted ?? Boolean(issue.hasUpvoted);
  const count = state?.count ?? issue.upvotes;

  const mutation = useMutation({
    mutationFn: () => issuesService.upvote<{ upvoted: boolean; upvoteCount: number }>(issue.id),
    onMutate: () => {
      const previous = { upvoted, count };
      setState({ upvoted: !upvoted, count: Math.max(0, count + (upvoted ? -1 : 1)) });
      return previous;
    },
    onSuccess: (data) => {
      if (data && typeof data === "object" && "upvoted" in data) {
        setState({ upvoted: Boolean(data.upvoted), count: Number(data.upvoteCount ?? 0) });
      }
      queryClient.invalidateQueries({ queryKey: ["issues"] });
      queryClient.invalidateQueries({ queryKey: ["issue", issue.id] });
    },
    onError: (error, _vars, previous) => {
      if (previous) setState(previous);
      gooeyToast.error("Couldn’t update your upvote", { description: error instanceof Error ? error.message : "Try again." });
    }
  });

  function toggle() {
    if (!requireAuth("Sign in to upvote this issue.")) return;
    if (!mutation.isPending) mutation.mutate();
  }

  return { upvoted, count, toggle, isPending: mutation.isPending };
}
