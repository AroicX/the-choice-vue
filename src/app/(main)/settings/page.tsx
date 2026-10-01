"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTheme } from "next-themes";
import { gooeyToast } from "goey-toast";
import { AuthField, PasswordStrength, PasswordToggle } from "@/components/auth/auth-field";
import { ProfilePhotoField, profilePayloadFromForm, type ProfileUpdatePayload } from "@/components/profile/profile-edit-modal";
import { TimelineEmpty } from "@/components/timeline/timeline";
import { Button } from "@/components/ui/button";
import { AppIcon } from "@/components/ui/icon";
import { states } from "@/lib/admin-control-data";
import { normalizeUserProfile, profilePath } from "@/lib/content-utils";
import {
  ArrowLeft01Icon,
  ArrowRight01Icon,
  Location01Icon,
  Logout01Icon,
  Moon02Icon,
  SecurityCheckIcon,
  UserCircleIcon
} from "@/lib/icons";
import { cn } from "@/lib/utils";
import { api } from "@/services/client/api";
import { endpoints } from "@/services/client/endpoints";
import { useAuthStore } from "@/stores/auth-store";
import type { ApiRecord, User } from "@/types";

type Section = "account" | "location" | "security" | "display";

const SECTIONS: Array<{ id: Section; label: string; hint: string; icon: typeof UserCircleIcon }> = [
  { id: "account", label: "Your account", hint: "Photo, name, username and bio", icon: UserCircleIcon },
  { id: "location", label: "Location", hint: "Your state powers the Local feed and nearby issues", icon: Location01Icon },
  { id: "security", label: "Password", hint: "Change the password you sign in with", icon: SecurityCheckIcon },
  { id: "display", label: "Display", hint: "Light, dark, or match your device", icon: Moon02Icon }
];

const selectClass =
  "h-11 w-full rounded-[10px] border border-input bg-transparent px-3 text-sm focus:border-foreground/40 focus:outline-none";

function unwrapUser(data: unknown) {
  return data && typeof data === "object" && "data" in data ? ((data as { data: unknown }).data as User) : (data as User);
}

/** Saves profile fields; shared by the Account and Location panels. */
function useProfileUpdate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: ProfileUpdatePayload) => unwrapUser((await api.patch(endpoints.users.update, payload)).data),
    onSuccess: (updated) => {
      const normalized = normalizeUserProfile(updated as ApiRecord);
      useAuthStore.setState((state) => ({ user: state.user ? { ...state.user, ...normalized } : normalized }));
      gooeyToast.success("Saved");
      queryClient.invalidateQueries({ queryKey: ["profile", "me"] });
      queryClient.invalidateQueries({ queryKey: ["public-profile"] });
      queryClient.invalidateQueries({ queryKey: ["feed"] });
    },
    onError: (error) => gooeyToast.error("Couldn’t save", { description: error instanceof Error ? error.message : "Try again." })
  });
}

function PanelHeader({ title, onBack }: { title: string; onBack?: () => void }) {
  return (
    <div className="sticky top-[53px] z-20 flex h-[53px] items-center gap-6 bg-background/85 px-2 backdrop-blur-md lg:top-0">
      {onBack ? (
        <button
          type="button"
          onClick={onBack}
          aria-label="Back to settings"
          className="grid size-9 place-items-center rounded-full transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <AppIcon icon={ArrowLeft01Icon} size={20} />
        </button>
      ) : null}
      <h1 className={cn("text-xl font-bold tracking-tight", !onBack && "px-2")}>{title}</h1>
    </div>
  );
}

function AccountPanel({ user }: { user: User }) {
  const update = useProfileUpdate();
  const [profilePic, setProfilePic] = useState(user.profilePic ?? "");
  const [about, setAbout] = useState(user.about ?? "");

  return (
    <form
      className="space-y-5 px-4 pb-10 pt-3"
      onSubmit={(event) => {
        event.preventDefault();
        const payload = profilePayloadFromForm(new FormData(event.currentTarget));
        if (!payload.username) {
          gooeyToast.error("Username can’t be empty");
          return;
        }
        update.mutate({ ...payload, about: about.trim(), profilePic: profilePic || undefined });
      }}
    >
      <ProfilePhotoField user={user} value={profilePic} onChange={setProfilePic} size="md" />
      <div className="grid gap-4 sm:grid-cols-2">
        <AuthField label="First name" name="firstName" autoComplete="given-name" defaultValue={user.firstName ?? ""} maxLength={50} />
        <AuthField label="Last name" name="lastName" autoComplete="family-name" defaultValue={user.lastName ?? ""} maxLength={50} />
      </div>
      <AuthField
        label="Username"
        name="username"
        autoComplete="username"
        defaultValue={user.username ?? ""}
        hint={`Your profile lives at ${profilePath(user)}`}
        maxLength={30}
      />
      <div>
        <label htmlFor="settings-bio" className="mb-1.5 block text-[13px] font-medium">
          Bio
        </label>
        <textarea
          id="settings-bio"
          value={about}
          onChange={(event) => setAbout(event.target.value)}
          rows={4}
          maxLength={160}
          placeholder="What do you care about?"
          className="w-full resize-none rounded-[10px] border border-input bg-transparent px-3 py-2.5 text-sm placeholder:text-muted-foreground/70 focus:border-foreground/40 focus:outline-none"
        />
        <p className="mt-1 text-right text-[12px] tabular-nums text-muted-foreground">{about.length}/160</p>
      </div>
      {user.email ? <AuthField label="Email" value={user.email} readOnly disabled hint="Email can’t be changed yet." /> : null}
      <div className="flex justify-end">
        <Button type="submit" disabled={update.isPending}>
          {update.isPending ? "Saving…" : "Save"}
        </Button>
      </div>
    </form>
  );
}

function LocationPanel({ user }: { user: User }) {
  const update = useProfileUpdate();
  const [state, setState] = useState(user.state ?? "");
  const [lga, setLga] = useState(user.lga ?? "");
  const dirty = state !== (user.state ?? "") || lga.trim() !== (user.lga ?? "");

  return (
    <form
      className="space-y-5 px-4 pb-10 pt-3"
      onSubmit={(event) => {
        event.preventDefault();
        if (!state) {
          gooeyToast.error("Pick your state");
          return;
        }
        update.mutate({ state, lga: lga.trim() || undefined });
      }}
    >
      <p className="text-[15px] text-muted-foreground">
        We use this to show you the Local feed, issues near you and your representatives. It isn’t shown on your profile.
      </p>
      <div>
        <label htmlFor="settings-state" className="mb-1.5 block text-[13px] font-medium">
          State
        </label>
        <select id="settings-state" value={state} onChange={(event) => setState(event.target.value)} className={selectClass}>
          <option value="">Choose…</option>
          {states.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>
      <AuthField label="LGA (optional)" placeholder="e.g. Eti-Osa" value={lga} onChange={(event) => setLga(event.target.value)} maxLength={80} />
      <div className="flex justify-end">
        <Button type="submit" disabled={update.isPending || !dirty}>
          {update.isPending ? "Saving…" : "Save"}
        </Button>
      </div>
    </form>
  );
}

function SecurityPanel() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [visible, setVisible] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const change = useMutation({
    mutationFn: () => api.patch(endpoints.users.changePassword, { old_password: current, password: next, c_password: confirm }),
    onSuccess: () => {
      gooeyToast.success("Password changed");
      setCurrent("");
      setNext("");
      setConfirm("");
    },
    onError: (error) =>
      gooeyToast.error("Couldn’t change password", { description: error instanceof Error ? error.message : "Check your current password." })
  });

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const found: Record<string, string> = {};
    if (!current) found.current = "Enter your current password";
    if (next.length < 8) found.next = "Use at least 8 characters";
    if (confirm !== next) found.confirm = "Passwords don’t match";
    setErrors(found);
    if (!Object.keys(found).length) change.mutate();
  }

  const type = visible ? "text" : "password";
  return (
    <form className="space-y-5 px-4 pb-10 pt-3" onSubmit={submit} noValidate>
      <AuthField
        label="Current password"
        type={type}
        autoComplete="current-password"
        value={current}
        onChange={(event) => setCurrent(event.target.value)}
        error={errors.current}
        trailing={<PasswordToggle visible={visible} onToggle={() => setVisible((value) => !value)} />}
      />
      <div>
        <AuthField
          label="New password"
          type={type}
          autoComplete="new-password"
          value={next}
          onChange={(event) => setNext(event.target.value)}
          error={errors.next}
        />
        {next ? <PasswordStrength value={next} /> : null}
      </div>
      <AuthField
        label="Confirm new password"
        type={type}
        autoComplete="new-password"
        value={confirm}
        onChange={(event) => setConfirm(event.target.value)}
        error={errors.confirm}
      />
      <div className="flex items-center justify-between gap-3">
        <Link href="/forgot-password" className="text-[14px] text-primary hover:underline">
          Forgot password?
        </Link>
        <Button type="submit" disabled={change.isPending}>
          {change.isPending ? "Changing…" : "Change password"}
        </Button>
      </div>
    </form>
  );
}

function DisplayPanel() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const options = [
    { id: "light", label: "Light" },
    { id: "dark", label: "Dark" },
    { id: "system", label: "Match device" }
  ];

  return (
    <div className="px-4 pb-10 pt-3">
      <p className="mb-3 text-[15px] text-muted-foreground">Choose how The Choice looks on this device.</p>
      <div role="radiogroup" aria-label="Theme" className="grid grid-cols-3 gap-2">
        {options.map((option) => {
          const active = mounted && theme === option.id;
          return (
            <button
              key={option.id}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => setTheme(option.id)}
              className={cn(
                "flex h-12 items-center justify-center gap-2 rounded-[10px] border text-[14px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                active ? "border-primary bg-primary/[0.06]" : "border-input hover:bg-accent"
              )}
            >
              <span
                className={cn("grid size-4 place-items-center rounded-full border-2", active ? "border-primary" : "border-input")}
                aria-hidden
              >
                {active ? <span className="size-1.5 rounded-full bg-primary" /> : null}
              </span>
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function isSection(value: string): value is Section {
  return SECTIONS.some((item) => item.id === value);
}

export default function SettingsPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const clearSession = useAuthStore((state) => state.clearSession);
  const [section, setSection] = useState<Section | null>(null);

  // Deep links (/settings#location) open a panel; the hash keeps Back sane.
  useEffect(() => {
    const read = () => {
      const hash = window.location.hash.slice(1);
      setSection(isSection(hash) ? hash : null);
    };
    read();
    window.addEventListener("hashchange", read);
    return () => window.removeEventListener("hashchange", read);
  }, []);

  function open(id: Section) {
    window.location.hash = id;
  }

  function close() {
    if (window.history.length > 1 && window.location.hash) router.back();
    else history.replaceState(null, "", "/settings");
    setSection(null);
  }

  if (!user) {
    return (
      <>
        <PanelHeader title="Settings" />
        <TimelineEmpty title="Sign in to manage your account" body="Your profile, location and password live here." href="/login" action="Log in" />
      </>
    );
  }

  const active = SECTIONS.find((item) => item.id === section);
  if (active) {
    return (
      <>
        <PanelHeader title={active.label} onBack={close} />
        {/* Keyed so each panel starts from the latest saved user. */}
        {active.id === "account" ? <AccountPanel key={user.id} user={user} /> : null}
        {active.id === "location" ? <LocationPanel key={`${user.state}-${user.lga}`} user={user} /> : null}
        {active.id === "security" ? <SecurityPanel /> : null}
        {active.id === "display" ? <DisplayPanel /> : null}
      </>
    );
  }

  return (
    <>
      <PanelHeader title="Settings" />
      <Link href={profilePath(user)} className="flex items-center gap-3 border-b px-4 py-4 transition-colors hover:bg-foreground/[0.03]">
        {user.profilePic ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={user.profilePic} alt="" className="size-12 rounded-full object-cover" />
        ) : (
          <span className="grid size-12 place-items-center rounded-full bg-secondary text-base font-bold" aria-hidden>
            {(user.firstName || user.username || "?").charAt(0).toUpperCase()}
          </span>
        )}
        <span className="min-w-0 flex-1 leading-5">
          <span className="block truncate text-[15px] font-bold">{[user.firstName, user.lastName].filter(Boolean).join(" ") || user.username}</span>
          <span className="block truncate text-[15px] text-muted-foreground">@{user.username}</span>
        </span>
        <span className="text-[14px] text-muted-foreground">View profile</span>
      </Link>

      <ul>
        {SECTIONS.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => open(item.id)}
              className="flex w-full items-center gap-4 px-4 py-3.5 text-left transition-colors hover:bg-foreground/[0.03] focus-visible:bg-foreground/[0.03] focus-visible:outline-none"
            >
              <AppIcon icon={item.icon} size={20} className="shrink-0 text-muted-foreground" />
              <span className="min-w-0 flex-1">
                <span className="block text-[15px] font-medium">{item.label}</span>
                <span className="block truncate text-[13px] text-muted-foreground">
                  {item.id === "location" && user.state ? [user.lga, user.state].filter(Boolean).join(", ") : item.hint}
                </span>
              </span>
              <AppIcon icon={ArrowRight01Icon} size={18} className="shrink-0 text-muted-foreground" />
            </button>
          </li>
        ))}
      </ul>

      <div className="mt-2 border-t">
        <button
          type="button"
          onClick={() => {
            clearSession();
            router.push("/login");
          }}
          className="flex w-full items-center gap-4 px-4 py-3.5 text-left text-destructive transition-colors hover:bg-destructive/[0.06] focus-visible:bg-destructive/[0.06] focus-visible:outline-none"
        >
          <AppIcon icon={Logout01Icon} size={20} className="shrink-0" />
          <span className="text-[15px] font-medium">Log out @{user.username}</span>
        </button>
      </div>
    </>
  );
}
