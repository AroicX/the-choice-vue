"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { gooeyToast } from "goey-toast";
import { AuthField } from "@/components/auth/auth-field";
import { Button } from "@/components/ui/button";
import { AppIcon } from "@/components/ui/icon";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { states } from "@/lib/admin-control-data";
import { ArrowLeft01Icon, Cancel01Icon, ImageAdd01Icon } from "@/lib/icons";
import { isImageFile, validateMediaFile } from "@/lib/media-utils";
import { cn } from "@/lib/utils";
import { issuesService } from "@/services/civic-content.service";
import { mediaService } from "@/services/media.service";
import type { ApiRecord } from "@/types";

const CATEGORIES = [
  "Roads & transport",
  "Power",
  "Water & sanitation",
  "Security",
  "Health",
  "Education",
  "Environment",
  "Corruption",
  "Elections",
  "Other"
];

const SCOPES = [
  { id: "LOCAL", label: "Local", hint: "Your street, ward or LGA" },
  { id: "STATE", label: "State", hint: "Affects your state" },
  { id: "NATIONAL", label: "National", hint: "Affects the country" }
] as const;

const MAX_PHOTOS = 4;

type Photo = { localId: string; preview: string; url?: string; uploading: boolean };

export default function CreateIssuePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { requireAuth } = useRequireAuth();
  const fileRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [scope, setScope] = useState<(typeof SCOPES)[number]["id"]>("LOCAL");
  const [state, setState] = useState("");
  const [lga, setLga] = useState("");
  const [ward, setWard] = useState("");
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const uploading = photos.some((photo) => photo.uploading);

  const create = useMutation({
    mutationFn: (payload: Record<string, unknown>) => issuesService.create<ApiRecord>(payload),
    onSuccess: (data) => {
      gooeyToast.success("Issue reported", { description: "Others can now see and upvote it." });
      queryClient.invalidateQueries({ queryKey: ["issues"] });
      const id = data && typeof data === "object" && "id" in data ? String(data.id) : null;
      router.replace(id ? `/issues/${id}` : "/issues?tab=mine");
    },
    onError: (error) => gooeyToast.error("Couldn’t report the issue", { description: error instanceof Error ? error.message : "Try again." })
  });

  async function addPhotos(files: FileList | null) {
    if (fileRef.current) fileRef.current.value = "";
    if (!files?.length) return;
    const room = MAX_PHOTOS - photos.length;
    for (const file of Array.from(files).slice(0, room)) {
      const problem = !isImageFile(file) ? "Evidence must be photos." : validateMediaFile(file);
      if (problem) {
        gooeyToast.error(problem);
        continue;
      }
      const localId = `${file.name}-${file.size}-${Date.now()}`;
      setPhotos((current) => [...current, { localId, preview: URL.createObjectURL(file), uploading: true }]);
      try {
        const uploaded = await mediaService.upload(file);
        setPhotos((current) => current.map((photo) => (photo.localId === localId ? { ...photo, url: uploaded.url, uploading: false } : photo)));
      } catch (error) {
        setPhotos((current) => current.filter((photo) => photo.localId !== localId));
        gooeyToast.error("Photo upload failed", { description: error instanceof Error ? error.message : "Try again." });
      }
    }
  }

  function validate() {
    const next: Record<string, string> = {};
    if (title.trim().length < 5) next.title = "Give it a short, clear title";
    if (description.trim().length < 20) next.description = "Describe what’s wrong in at least a sentence or two";
    if (!category) next.category = "Pick a category";
    if (!state) next.state = "Pick a state";
    setErrors(next);
    return !Object.keys(next).length;
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!requireAuth("Sign in to report a civic issue.")) return;
    if (!validate() || uploading) return;
    const photoUrls = photos.map((photo) => photo.url).filter((url): url is string => Boolean(url));
    create.mutate({
      title: title.trim(),
      description: description.trim(),
      category,
      type: scope,
      state,
      lga: lga.trim() || undefined,
      ward: ward.trim() || undefined,
      evidence: photoUrls.length ? { photos: photoUrls } : undefined
    });
  }

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
        <h1 className="text-xl font-bold tracking-tight">Report an issue</h1>
      </div>

      <form onSubmit={submit} className="space-y-6 px-4 pb-10 pt-3" noValidate>
        <AuthField
          label="What’s the problem?"
          placeholder="e.g. Collapsed drainage on Adeola Odeku Street"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          error={errors.title}
          maxLength={120}
        />

        <div>
          <label htmlFor="issue-description" className="mb-1.5 block text-[13px] font-medium">
            Details
          </label>
          <textarea
            id="issue-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={5}
            placeholder="What happened, who it affects, and how long it’s been going on."
            aria-invalid={errors.description ? true : undefined}
            className="w-full resize-y rounded-[10px] border border-input bg-transparent px-3 py-2.5 text-sm placeholder:text-muted-foreground/70 focus:border-foreground/40 focus:outline-none aria-[invalid=true]:border-destructive"
          />
          {errors.description ? <p className="mt-1.5 text-[13px] text-destructive">{errors.description}</p> : null}
        </div>

        <fieldset>
          <legend className="mb-2 text-[13px] font-medium">Category</legend>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((item) => (
              <button
                key={item}
                type="button"
                aria-pressed={category === item}
                onClick={() => setCategory(item)}
                className={cn(
                  "h-9 rounded-full border px-3.5 text-[14px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  category === item ? "border-foreground bg-foreground text-background" : "border-input hover:bg-accent"
                )}
              >
                {item}
              </button>
            ))}
          </div>
          {errors.category ? <p className="mt-1.5 text-[13px] text-destructive">{errors.category}</p> : null}
        </fieldset>

        <fieldset>
          <legend className="mb-2 text-[13px] font-medium">How far does it reach?</legend>
          <div className="grid grid-cols-3 gap-2">
            {SCOPES.map((item) => (
              <button
                key={item.id}
                type="button"
                aria-pressed={scope === item.id}
                onClick={() => setScope(item.id)}
                className={cn(
                  "rounded-[10px] border px-3 py-2.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  scope === item.id ? "border-foreground bg-foreground/[0.04]" : "border-input hover:bg-accent"
                )}
              >
                <span className="block text-[14px] font-semibold">{item.label}</span>
                <span className="block text-[12px] text-muted-foreground">{item.hint}</span>
              </button>
            ))}
          </div>
        </fieldset>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="issue-state" className="mb-1.5 block text-[13px] font-medium">
              State
            </label>
            <select
              id="issue-state"
              value={state}
              onChange={(event) => setState(event.target.value)}
              aria-invalid={errors.state ? true : undefined}
              className="h-11 w-full rounded-[10px] border border-input bg-transparent px-3 text-sm focus:border-foreground/40 focus:outline-none aria-[invalid=true]:border-destructive"
            >
              <option value="">Choose…</option>
              {states.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
            {errors.state ? <p className="mt-1.5 text-[13px] text-destructive">{errors.state}</p> : null}
          </div>
          <AuthField label="LGA (optional)" placeholder="e.g. Eti-Osa" value={lga} onChange={(event) => setLga(event.target.value)} />
          <AuthField label="Ward (optional)" placeholder="e.g. Ward 3" value={ward} onChange={(event) => setWard(event.target.value)} />
        </div>

        <div>
          <p className="mb-2 text-[13px] font-medium">Photos (optional, up to {MAX_PHOTOS})</p>
          <div className="flex flex-wrap gap-2">
            {photos.map((photo) => (
              <span key={photo.localId} className="relative size-20 overflow-hidden rounded-[10px] bg-secondary">
                <Image src={photo.preview} alt="" fill className="object-cover" sizes="80px" unoptimized />
                {photo.uploading ? (
                  <span className="absolute inset-0 grid place-items-center bg-black/40 text-[11px] font-medium text-white">Uploading…</span>
                ) : (
                  <button
                    type="button"
                    aria-label="Remove photo"
                    onClick={() => setPhotos((current) => current.filter((item) => item.localId !== photo.localId))}
                    className="absolute right-1 top-1 grid size-6 place-items-center rounded-full bg-black/60 text-white"
                  >
                    <AppIcon icon={Cancel01Icon} size={14} />
                  </button>
                )}
              </span>
            ))}
            {photos.length < MAX_PHOTOS ? (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="grid size-20 place-items-center rounded-[10px] border border-dashed border-input text-muted-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label="Add photos"
              >
                <AppIcon icon={ImageAdd01Icon} size={22} />
              </button>
            ) : null}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            multiple
            className="hidden"
            onChange={(event) => void addPhotos(event.target.files)}
          />
        </div>

        <Button type="submit" size="lg" className="w-full" disabled={create.isPending || uploading}>
          {create.isPending ? "Reporting…" : uploading ? "Waiting for photos…" : "Report issue"}
        </Button>
      </form>
    </>
  );
}
