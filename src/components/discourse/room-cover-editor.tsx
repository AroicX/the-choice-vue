"use client";

import { useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { gooeyToast } from "goey-toast";
import { AppIcon } from "@/components/ui/icon";
import { ImageAdd01Icon } from "@/lib/icons";
import { isImageFile, validateMediaFile } from "@/lib/media-utils";
import { discussionsService } from "@/services/discussions.service";
import { mediaService } from "@/services/media.service";

const pill =
  "inline-flex h-9 items-center gap-1.5 rounded-full bg-black/55 px-3.5 text-[13px] font-semibold text-white backdrop-blur-md transition-colors hover:bg-black/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white disabled:opacity-60";

/**
 * Owner controls laid over the room banner: change the cover, or remove it to
 * return to the generated pattern. Invalidates the room and room lists on save.
 */
export function RoomCoverEditor({
  discussionId,
  hasCover,
  detailQueryKey
}: {
  discussionId: string;
  hasCover: boolean;
  detailQueryKey: readonly unknown[];
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const save = useMutation({
    mutationFn: async (file: File | null) => {
      if (!file) return discussionsService.setCover(discussionId, null);
      const uploaded = await mediaService.upload(file);
      return discussionsService.setCover(discussionId, uploaded.url);
    },
    onSuccess: (_data, file) => {
      gooeyToast.success(file ? "Cover updated" : "Cover removed");
      queryClient.invalidateQueries({ queryKey: detailQueryKey });
      queryClient.invalidateQueries({ queryKey: ["discussions"] });
    },
    onError: (error) => {
      gooeyToast.error("Couldn’t update the cover", {
        description: error instanceof Error ? error.message : "Try again."
      });
    }
  });

  function pick(files: FileList | null) {
    const file = files?.[0];
    if (inputRef.current) inputRef.current.value = "";
    if (!file) return;
    const problem = !isImageFile(file) ? "Covers must be an image." : validateMediaFile(file);
    if (problem) {
      gooeyToast.error(problem);
      return;
    }
    save.mutate(file);
  }

  return (
    <div className="absolute bottom-3 right-3 flex gap-2">
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        className="hidden"
        onChange={(event) => pick(event.target.files)}
      />
      {hasCover ? (
        <button type="button" className={pill} disabled={save.isPending} onClick={() => save.mutate(null)}>
          Remove
        </button>
      ) : null}
      <button type="button" className={pill} disabled={save.isPending} onClick={() => inputRef.current?.click()}>
        <AppIcon icon={ImageAdd01Icon} size={16} />
        {save.isPending ? "Saving…" : hasCover ? "Change cover" : "Add cover"}
      </button>
    </div>
  );
}
