import type { Post } from "@/types";
import { cn } from "@/lib/utils";

type PostQuoteProps = {
  post: Pick<Post, "author" | "handle" | "topic" | "message">;
  className?: string;
  compact?: boolean;
};

export function PostQuote({ post, className, compact = false }: PostQuoteProps) {
  return (
    <blockquote
      className={cn(
        "rounded-xl border border-primary/15 bg-gradient-to-br from-accent/30 via-background/80 to-secondary/40",
        compact ? "p-3" : "p-4",
        className
      )}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 h-full w-1 shrink-0 rounded-full bg-primary" />
        <div className="min-w-0">
          <p className="text-sm font-semibold">{post.author}</p>
          <p className="text-xs text-muted-foreground">{post.handle} in {post.topic}</p>
          <p className={cn("mt-2 text-foreground", compact ? "line-clamp-3 text-sm leading-6" : "line-clamp-4 text-sm leading-6")}>
            {post.message}
          </p>
        </div>
      </div>
    </blockquote>
  );
}
