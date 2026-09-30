"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { MediaAttachmentPicker, readyMediaAttachments, type PendingMedia } from "@/components/media/media-attachment-picker";
import { usePostComment } from "@/hooks/use-post-comment";
import { userInitials } from "@/lib/content-utils";
import { useAuthStore } from "@/stores/auth-store";
import { useLoginModalStore } from "@/stores/login-modal-store";
import type { Post } from "@/types";
import { cn } from "@/lib/utils";

type PostCommentComposerProps = {
  post: Pick<Post, "id" | "author" | "handle">;
  onSuccess?: () => void;
  className?: string;
  /** Focuses the text area whenever this number changes (and is > 0). */
  focusSignal?: number;
};

/**
 * Inline reply box under a post, X-style: avatar, auto-growing text area,
 * icon-only media picker and a Reply button. Guests get a sign-in prompt.
 */
export function PostCommentComposer({ post, onSuccess, className, focusSignal = 0 }: PostCommentComposerProps) {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const openLoginModal = useLoginModalStore((state) => state.open);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [media, setMedia] = useState<PendingMedia[]>([]);
  const { message, setMessage, submitComment, isPending } = usePostComment(post.id, {
    onSuccess: () => {
      setMedia([]);
      if (textareaRef.current) textareaRef.current.style.height = "";
      onSuccess?.();
    }
  });

  useEffect(() => {
    if (!focusSignal) return;
    textareaRef.current?.focus();
    textareaRef.current?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [focusSignal]);

  const readyMedia = readyMediaAttachments(media);
  const uploading = media.some((item) => item.uploading);
  const canSubmit = Boolean(message.trim() || readyMedia.length) && !isPending && !uploading;
  const handle = post.handle.startsWith("@") ? post.handle : `@${post.handle}`;

  if (!isAuthenticated || !user) {
    return (
      <div className={cn("flex items-center justify-between gap-4 border-b px-4 py-3", className)}>
        <p className="text-[15px] text-muted-foreground">Sign in to join the conversation.</p>
        <Button size="sm" onClick={() => openLoginModal("Sign in to reply to this post.")}>
          Sign in
        </Button>
      </div>
    );
  }

  return (
    <form
      className={cn("flex gap-3 border-b px-4 py-3", className)}
      onSubmit={(event) => {
        event.preventDefault();
        if (canSubmit) submitComment(readyMedia);
      }}
    >
      {user.profilePic ? (
        <Image src={user.profilePic} alt="" width={40} height={40} className="size-10 shrink-0 rounded-full object-cover" />
      ) : (
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-secondary text-sm font-bold" aria-hidden>
          {userInitials(user)}
        </span>
      )}
      <div className="min-w-0 flex-1">
        <p className="text-[13px] text-muted-foreground">
          Replying to <span className="text-primary">{handle}</span>
        </p>
        <label htmlFor={`reply-${post.id}`} className="sr-only">
          Post your reply
        </label>
        <textarea
          id={`reply-${post.id}`}
          ref={textareaRef}
          value={message}
          onChange={(event) => {
            setMessage(event.target.value);
            // Grow with the text instead of scrolling inside a tiny box.
            event.target.style.height = "auto";
            event.target.style.height = `${event.target.scrollHeight}px`;
          }}
          placeholder="Post your reply"
          rows={1}
          disabled={isPending}
          className="block max-h-72 w-full resize-none bg-transparent py-2 text-[17px] leading-6 placeholder:text-muted-foreground focus:outline-none"
        />
        <div className="flex items-start justify-between gap-3 pt-1">
          <MediaAttachmentPicker items={media} onChange={setMedia} disabled={isPending} compact className="flex-1" />
          <Button type="submit" size="sm" disabled={!canSubmit}>
            {isPending ? "Replying…" : "Reply"}
          </Button>
        </div>
      </div>
    </form>
  );
}
