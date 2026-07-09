"use client";

import { useEffect } from "react";
import { Cancel01Icon } from "@/lib/icons";
import { PostCommentComposer } from "@/components/comments/post-comment-composer";
import { AppIcon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCommentModalStore } from "@/stores/comment-modal-store";

export function CommentModal() {
  const { isOpen, post, close } = useCommentModalStore();

  useEffect(() => {
    if (!isOpen) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") close();
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [close, isOpen]);

  if (!isOpen || !post) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close comment modal"
        className="absolute inset-0 bg-background/75 backdrop-blur-xl"
        onClick={close}
      />
      <Card className="relative z-10 w-full max-w-lg border-primary/15 shadow-panel">
        <CardContent className="p-6">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold">Reply to post</h2>
              <p className="mt-1 text-sm text-muted-foreground">Add your voice to this civic conversation.</p>
            </div>
            <Button variant="ghost" size="icon" aria-label="Close" onClick={close}>
              <AppIcon icon={Cancel01Icon} size={18} />
            </Button>
          </div>
          <PostCommentComposer post={post} autoFocus onSuccess={close} />
        </CardContent>
      </Card>
    </div>
  );
}
