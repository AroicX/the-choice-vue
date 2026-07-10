"use client";

import { useEffect, useRef, useState } from "react";
import { gooeyToast } from "goey-toast";
import { AppIcon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Cancel01Icon, ImageAdd01Icon } from "@/lib/icons";
import { isImageFile, validateMediaFile } from "@/lib/media-utils";
import { mediaService } from "@/services/media.service";
import { userInitials } from "@/lib/content-utils";
import { cn } from "@/lib/utils";
import type { User } from "@/types";

export type ProfileUpdatePayload = {
  firstName?: string;
  lastName?: string;
  username?: string;
  about?: string;
  profilePic?: string;
};

function formValue(form: FormData, key: string) {
  const value = String(form.get(key) ?? "").trim();
  return value || undefined;
}

export function profilePayloadFromForm(form: FormData): ProfileUpdatePayload {
  return {
    firstName: formValue(form, "firstName"),
    lastName: formValue(form, "lastName"),
    username: formValue(form, "username"),
    about: formValue(form, "about"),
    profilePic: formValue(form, "profilePic")
  };
}

export function ProfilePhotoField({
  user,
  value,
  onChange,
  size = "lg"
}: {
  user: Pick<User, "firstName" | "lastName" | "username" | "email" | "profilePic">;
  value?: string;
  onChange: (url: string) => void;
  size?: "md" | "lg";
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState(value || user.profilePic || "");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    setPreview(value || user.profilePic || "");
  }, [user.profilePic, value]);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    if (!isImageFile(file)) {
      gooeyToast.error("Choose an image file");
      return;
    }
    const validationError = validateMediaFile(file);
    if (validationError) {
      gooeyToast.error(validationError);
      return;
    }

    const localUrl = URL.createObjectURL(file);
    setPreview(localUrl);
    setUploading(true);

    try {
      const uploaded = await mediaService.upload(file);
      setPreview(uploaded.url);
      onChange(uploaded.url);
      gooeyToast.success("Photo uploaded");
    } catch (error) {
      setPreview(value || user.profilePic || "");
      gooeyToast.error("Upload failed", {
        description: error instanceof Error ? error.message : "Try another image."
      });
    } finally {
      URL.revokeObjectURL(localUrl);
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  const dimension = size === "lg" ? "h-28 w-28" : "h-20 w-20";

  return (
    <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-center">
      <div className={cn("relative shrink-0", dimension)}>
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt={user.username} className={cn(dimension, "rounded-full object-cover ring-4 ring-background")} />
        ) : (
          <div className={cn(dimension, "grid place-items-center rounded-full bg-primary/15 text-2xl font-bold text-primary ring-4 ring-background")}>
            {userInitials(user)}
          </div>
        )}
        <button
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          className="absolute bottom-0 right-0 grid h-9 w-9 place-items-center rounded-full border border-border bg-background text-foreground shadow-sm transition hover:bg-accent disabled:opacity-60"
          aria-label="Upload profile photo"
        >
          <AppIcon icon={ImageAdd01Icon} size={16} />
        </button>
      </div>

      <div className="min-w-0 text-center sm:text-left">
        <p className="text-sm font-medium">Profile photo</p>
        <p className="mt-1 text-xs text-muted-foreground">JPG, PNG, or WebP up to 3MB. Shown on posts and your public profile.</p>
        <div className="mt-3 flex flex-wrap justify-center gap-2 sm:justify-start">
          <Button type="button" size="sm" variant="outline" disabled={uploading} onClick={() => inputRef.current?.click()}>
            {uploading ? "Uploading..." : preview ? "Change photo" : "Upload photo"}
          </Button>
          {preview ? (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              disabled={uploading}
              onClick={() => {
                setPreview("");
                onChange("");
              }}
            >
              Remove
            </Button>
          ) : null}
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
        className="hidden"
        onChange={(event) => void handleFile(event.target.files?.[0])}
      />
    </div>
  );
}

export function ProfileEditModal({
  open,
  user,
  loading,
  onClose,
  onSubmit
}: {
  open: boolean;
  user: User;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (payload: ProfileUpdatePayload) => void;
}) {
  const [profilePic, setProfilePic] = useState(user.profilePic ?? "");

  useEffect(() => {
    if (!open) return;
    setProfilePic(user.profilePic ?? "");

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose, user.profilePic]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center p-0 sm:items-center sm:p-4">
      <button type="button" aria-label="Close edit profile" className="absolute inset-0 bg-slate-900/45 backdrop-blur-[2px]" onClick={onClose} />

      <div className="relative z-10 flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl border border-border bg-background shadow-2xl sm:rounded-3xl">
        <div className="flex items-center justify-between gap-3 border-b border-border/70 px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold">Edit profile</h2>
            <p className="mt-0.5 text-sm text-muted-foreground">Update your photo and public details.</p>
          </div>
          <Button variant="ghost" size="icon" aria-label="Close" onClick={onClose}>
            <AppIcon icon={Cancel01Icon} size={18} />
          </Button>
        </div>

        <form
          className="space-y-5 overflow-y-auto p-5"
          onSubmit={(event) => {
            event.preventDefault();
            const payload = profilePayloadFromForm(new FormData(event.currentTarget));
            onSubmit({ ...payload, profilePic });
          }}
        >
          <input type="hidden" name="profilePic" value={profilePic} />

          <div className="rounded-2xl border border-border/70 bg-muted/30 p-4">
            <ProfilePhotoField user={user} value={profilePic} onChange={setProfilePic} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm font-medium">
              <span>First name</span>
              <Input name="firstName" defaultValue={user.firstName ?? ""} />
            </label>
            <label className="space-y-2 text-sm font-medium">
              <span>Last name</span>
              <Input name="lastName" defaultValue={user.lastName ?? ""} />
            </label>
            <label className="space-y-2 text-sm font-medium sm:col-span-2">
              <span>Username</span>
              <Input name="username" defaultValue={user.username ?? ""} />
            </label>
            <label className="space-y-2 text-sm font-medium sm:col-span-2">
              <span>Bio</span>
              <textarea
                name="about"
                defaultValue={user.about ?? ""}
                placeholder="Tell citizens what you care about..."
                className="min-h-28 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </label>
          </div>

          <div className="sticky bottom-0 -mx-5 border-t border-border/70 bg-background/95 px-5 py-4 backdrop-blur">
            <div className="flex gap-2">
              <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" className="flex-1" disabled={loading}>
                {loading ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
