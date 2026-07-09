"use client";

import { AppIcon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { PostQuote } from "@/components/comments/post-quote";
import { usePostComment } from "@/hooks/use-post-comment";
import { Comment01Icon } from "@/lib/icons";
import type { Post } from "@/types";
import { cn } from "@/lib/utils";

type PostCommentComposerProps = {
  post: Pick<Post, "id" | "author" | "handle" | "topic" | "message">;
  onSuccess?: () => void;
  showQuote?: boolean;
  className?: string;
  autoFocus?: boolean;
};

export function PostCommentComposer({
  post,
  onSuccess,
  showQuote = true,
  className,
  autoFocus = false
}: PostCommentComposerProps) {
  const { message, setMessage, submitComment, isPending } = usePostComment(post.id, { onSuccess });

  function handleSubmit() {
    submitComment();
  }

  return (
    <div className={cn("space-y-4", className)}>
      {showQuote ? <PostQuote post={post} compact /> : null}
      <div className="space-y-3">
        <label className="block space-y-2">
          <span className="text-sm font-medium">Your comment</span>
          <textarea
            autoFocus={autoFocus}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Share your civic perspective..."
            rows={4}
            className="min-h-8 w-full resize-y rounded-xl border border-input bg-background/80 px-3.5 py-3 text-sm shadow-sm ring-offset-background backdrop-blur-sm transition-all placeholder:text-muted-foreground focus-visible:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 disabled:cursor-not-allowed disabled:opacity-50"
          />
        </label>
        <div className="flex items-center justify-end gap-2">
          <Button
            onClick={handleSubmit}
            disabled={!message.trim() || isPending}
          >
            <AppIcon icon={Comment01Icon} size={18} />
            {/* {isPending ? "Posting..." : "Post comment"} */}
          </Button>
        </div>
      </div>
    </div>
  );
}
