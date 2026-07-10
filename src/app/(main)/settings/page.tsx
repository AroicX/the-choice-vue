"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { gooeyToast } from "goey-toast";
import { ProfilePhotoField, profilePayloadFromForm, type ProfileUpdatePayload } from "@/components/profile/profile-edit-modal";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { AppIcon } from "@/components/ui/icon";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  ArrowRight01Icon,
  Edit02Icon,
  Logout01Icon,
  Notification03Icon,
  SecurityCheckIcon,
  Settings01Icon,
  UserCircleIcon
} from "@/lib/icons";
import { normalizeUserProfile, profilePath, userDisplayName, userInitials } from "@/lib/content-utils";
import { cn } from "@/lib/utils";
import { api } from "@/services/client/api";
import { endpoints } from "@/services/client/endpoints";
import { useAuthStore } from "@/stores/auth-store";
import type { ApiRecord, User } from "@/types";

type Preferences = {
  emailUpdates: boolean;
  civicDigest: boolean;
  moderationAlerts: boolean;
  publicProfile: boolean;
  showActivity: boolean;
};

type SettingsSection = "account" | "security" | "notifications" | "privacy" | "display";

const defaultPreferences: Preferences = {
  emailUpdates: true,
  civicDigest: true,
  moderationAlerts: true,
  publicProfile: true,
  showActivity: true
};

const NAV: Array<{ id: SettingsSection; label: string; description: string; icon: typeof Settings01Icon }> = [
  { id: "account", label: "Account", description: "Photo, name, bio", icon: UserCircleIcon },
  { id: "security", label: "Security", description: "Password & login", icon: SecurityCheckIcon },
  { id: "notifications", label: "Notifications", description: "Email & alerts", icon: Notification03Icon },
  { id: "privacy", label: "Privacy", description: "Visibility controls", icon: Settings01Icon },
  { id: "display", label: "Display", description: "Theme preference", icon: Edit02Icon }
];

function preferenceKey(userId?: string) {
  return `choice9ja-settings-${userId ?? "guest"}`;
}

function ToggleRow({
  label,
  description,
  checked,
  onChange
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-4 rounded-2xl border border-border/70 bg-card px-4 py-3.5 text-left transition hover:bg-accent/40"
    >
      <div className="min-w-0">
        <p className="text-sm font-medium">{label}</p>
        <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      </div>
      <span
        className={cn(
          "relative h-7 w-12 shrink-0 rounded-full transition",
          checked ? "bg-primary" : "bg-muted"
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition",
            checked ? "left-5" : "left-0.5"
          )}
        />
      </span>
    </button>
  );
}

function cleanPasswordPayload(form: FormData) {
  return {
    old_password: String(form.get("old_password") ?? ""),
    password: String(form.get("password") ?? ""),
    c_password: String(form.get("c_password") ?? "")
  };
}

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const clearSession = useAuthStore((state) => state.clearSession);
  const [section, setSection] = useState<SettingsSection>("account");
  const [preferences, setPreferences] = useState<Preferences>(defaultPreferences);
  const [profilePic, setProfilePic] = useState(user?.profilePic ?? "");

  useEffect(() => {
    setProfilePic(user?.profilePic ?? "");
  }, [user?.profilePic]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = window.localStorage.getItem(preferenceKey(user?.id));
    setPreferences(saved ? { ...defaultPreferences, ...JSON.parse(saved) } : defaultPreferences);
  }, [user?.id]);

  function updatePreference(key: keyof Preferences, value: boolean) {
    const next = { ...preferences, [key]: value };
    setPreferences(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(preferenceKey(user?.id), JSON.stringify(next));
    }
    gooeyToast.success("Preference saved");
  }

  const updateProfileMutation = useMutation({
    mutationFn: async (payload: ProfileUpdatePayload) => {
      const response = await api.patch(endpoints.users.update, payload);
      return response.data && typeof response.data === "object" && "data" in response.data
        ? (response.data.data as User)
        : (response.data as User);
    },
    onSuccess: (updatedUser) => {
      const normalized = normalizeUserProfile(updatedUser as ApiRecord);
      useAuthStore.setState((state) => ({ user: state.user ? { ...state.user, ...normalized } : normalized }));
      setProfilePic(normalized.profilePic ?? "");
      gooeyToast.success("Profile updated");
      queryClient.invalidateQueries({ queryKey: ["profile", "me"] });
      queryClient.invalidateQueries({ queryKey: ["public-profile"] });
    },
    onError: (error) => {
      gooeyToast.error("Profile update failed", {
        description: error instanceof Error ? error.message : "Try again."
      });
    }
  });

  const passwordMutation = useMutation({
    mutationFn: (payload: ReturnType<typeof cleanPasswordPayload>) =>
      api.patch(endpoints.users.changePassword, payload),
    onSuccess: () => {
      gooeyToast.success("Password updated");
      const form = document.getElementById("settings-password-form") as HTMLFormElement | null;
      form?.reset();
    },
    onError: (error) => {
      gooeyToast.error("Password update failed", {
        description: error instanceof Error ? error.message : "Check your current password and try again."
      });
    }
  });

  if (!user) {
    return (
      <div className="mx-auto max-w-lg space-y-4">
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <Card>
          <CardContent className="space-y-4 p-8 text-center">
            <p className="text-muted-foreground">Sign in to manage your account settings.</p>
            <Button asChild>
              <Link href="/login">Log in</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Settings</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage your account like you would on X, WhatsApp, or TikTok.</p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/profile">View profile</Link>
        </Button>
      </div>

      <Card className="overflow-hidden">
        <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div className="flex items-center gap-3">
            {user.profilePic ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.profilePic} alt={userDisplayName(user)} className="h-14 w-14 rounded-full object-cover" />
            ) : (
              <div className="grid h-14 w-14 place-items-center rounded-full bg-primary/15 text-sm font-bold text-primary">
                {userInitials(user)}
              </div>
            )}
            <div className="min-w-0">
              <p className="truncate font-semibold">{userDisplayName(user)}</p>
              <p className="truncate text-sm text-muted-foreground">{user.email ?? `@${user.username}`}</p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                <Badge variant="secondary">{user.role.replaceAll("_", " ")}</Badge>
                {user.verified ? <Badge variant="outline">Verified</Badge> : null}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href={profilePath(user)}>Public profile</Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/profile">
                <AppIcon icon={Edit02Icon} size={14} className="mr-1.5" />
                Edit on profile
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-5 lg:grid-cols-[240px_minmax(0,1fr)]">
        <nav className="flex gap-2 overflow-x-auto lg:block lg:space-y-1.5 lg:overflow-visible">
          {NAV.map((item) => {
            const active = section === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setSection(item.id)}
                className={cn(
                  "flex min-w-[160px] items-center gap-3 rounded-2xl border px-3 py-3 text-left transition lg:min-w-0 lg:w-full",
                  active
                    ? "border-primary/30 bg-primary/10 text-foreground"
                    : "border-transparent bg-card hover:bg-accent/50"
                )}
              >
                <span className={cn("grid h-9 w-9 place-items-center rounded-xl", active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>
                  <AppIcon icon={item.icon} size={16} />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold">{item.label}</span>
                  <span className="hidden text-xs text-muted-foreground lg:block">{item.description}</span>
                </span>
              </button>
            );
          })}
        </nav>

        <div className="space-y-4">
          {section === "account" ? (
            <Card>
              <CardContent className="space-y-5 p-5">
                <div>
                  <h2 className="text-lg font-semibold">Account</h2>
                  <p className="mt-1 text-sm text-muted-foreground">Photo and details shown on your public profile.</p>
                </div>

                <form
                  className="space-y-5"
                  onSubmit={(event) => {
                    event.preventDefault();
                    const payload = profilePayloadFromForm(new FormData(event.currentTarget));
                    updateProfileMutation.mutate({ ...payload, profilePic });
                  }}
                >
                  <input type="hidden" name="profilePic" value={profilePic} />
                  <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
                    <ProfilePhotoField user={user} value={profilePic} onChange={setProfilePic} size="md" />
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
                        className="min-h-28 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      />
                    </label>
                  </div>

                  <div className="flex justify-end">
                    <Button type="submit" disabled={updateProfileMutation.isPending}>
                      {updateProfileMutation.isPending ? "Saving..." : "Save changes"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          ) : null}

          {section === "security" ? (
            <Card>
              <CardContent className="space-y-5 p-5">
                <div>
                  <h2 className="text-lg font-semibold">Security</h2>
                  <p className="mt-1 text-sm text-muted-foreground">Keep your account protected with a strong password.</p>
                </div>
                <form
                  id="settings-password-form"
                  className="space-y-4"
                  onSubmit={(event) => {
                    event.preventDefault();
                    const payload = cleanPasswordPayload(new FormData(event.currentTarget));
                    if (payload.password !== payload.c_password) {
                      gooeyToast.error("Passwords do not match");
                      return;
                    }
                    passwordMutation.mutate(payload);
                  }}
                >
                  <label className="block space-y-2 text-sm font-medium">
                    <span>Current password</span>
                    <Input name="old_password" type="password" required />
                  </label>
                  <label className="block space-y-2 text-sm font-medium">
                    <span>New password</span>
                    <Input name="password" type="password" required minLength={8} />
                  </label>
                  <label className="block space-y-2 text-sm font-medium">
                    <span>Confirm new password</span>
                    <Input name="c_password" type="password" required minLength={8} />
                  </label>
                  <Button type="submit" disabled={passwordMutation.isPending}>
                    {passwordMutation.isPending ? "Updating..." : "Update password"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          ) : null}

          {section === "notifications" ? (
            <Card>
              <CardContent className="space-y-4 p-5">
                <div>
                  <h2 className="text-lg font-semibold">Notifications</h2>
                  <p className="mt-1 text-sm text-muted-foreground">Choose what reaches your inbox.</p>
                </div>
                <ToggleRow
                  label="Email updates"
                  description="Important account and civic updates."
                  checked={preferences.emailUpdates}
                  onChange={(value) => updatePreference("emailUpdates", value)}
                />
                <ToggleRow
                  label="Civic digest"
                  description="Periodic summary of discussions and polls."
                  checked={preferences.civicDigest}
                  onChange={(value) => updatePreference("civicDigest", value)}
                />
                <ToggleRow
                  label="Moderation alerts"
                  description="When reports or safety actions affect your content."
                  checked={preferences.moderationAlerts}
                  onChange={(value) => updatePreference("moderationAlerts", value)}
                />
              </CardContent>
            </Card>
          ) : null}

          {section === "privacy" ? (
            <Card>
              <CardContent className="space-y-4 p-5">
                <div>
                  <h2 className="text-lg font-semibold">Privacy</h2>
                  <p className="mt-1 text-sm text-muted-foreground">Control what other citizens can see.</p>
                </div>
                <ToggleRow
                  label="Public profile"
                  description="Allow others to view your public profile."
                  checked={preferences.publicProfile}
                  onChange={(value) => updatePreference("publicProfile", value)}
                />
                <ToggleRow
                  label="Show activity"
                  description="Show recent posts, votes, and follows on your profile."
                  checked={preferences.showActivity}
                  onChange={(value) => updatePreference("showActivity", value)}
                />
              </CardContent>
            </Card>
          ) : null}

          {section === "display" ? (
            <Card>
              <CardContent className="space-y-4 p-5">
                <div>
                  <h2 className="text-lg font-semibold">Display</h2>
                  <p className="mt-1 text-sm text-muted-foreground">Match the look of the app to your preference.</p>
                </div>
                <div className="flex items-center justify-between rounded-2xl border border-border/70 px-4 py-3.5">
                  <div>
                    <p className="text-sm font-medium">Theme</p>
                    <p className="mt-1 text-xs text-muted-foreground">Switch between light and dark mode.</p>
                  </div>
                  <ThemeToggle />
                </div>
              </CardContent>
            </Card>
          ) : null}

          <Card className="border-destructive/20">
            <CardContent className="space-y-3 p-5">
              <h2 className="text-sm font-semibold text-destructive">Danger zone</h2>
              <button
                type="button"
                onClick={clearSession}
                className="flex w-full items-center justify-between rounded-2xl border border-destructive/25 bg-destructive/5 px-4 py-3.5 text-left transition hover:bg-destructive/10"
              >
                <span className="flex items-center gap-3">
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-destructive/15 text-destructive">
                    <AppIcon icon={Logout01Icon} size={16} />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold">Log out</span>
                    <span className="block text-xs text-muted-foreground">Sign out of this device</span>
                  </span>
                </span>
                <AppIcon icon={ArrowRight01Icon} size={16} className="text-muted-foreground" />
              </button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
