"use client";

import * as React from "react";
import { AppIcon } from "@/components/ui/icon";
import { Alert02Icon, CheckmarkCircle02Icon } from "@/lib/icons";
import { cn } from "@/lib/utils";
import { gooeyToast } from "goey-toast";

type AuthFieldProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  hint?: string;
  /** Positive confirmation shown under the field, e.g. "username is available". */
  success?: string;
  /** Rendered inside the field on the right, e.g. a show/hide toggle. */
  trailing?: React.ReactNode;
};

/**
 * Label-above input: 44px tall, hairline border, no fill. Focus is a darker
 * border plus a soft ring; errors swap both to the destructive colour.
 */
export const AuthField = React.forwardRef<HTMLInputElement, AuthFieldProps>(
  ({ label, error, hint, success, trailing, id, className, ...props }, ref) => {
    const generatedId = React.useId();
    const inputId = id ?? generatedId;
    const describedBy = error ? `${inputId}-error` : success || hint ? `${inputId}-hint` : undefined;

    return (
      <div className={className}>
        <label htmlFor={inputId} className="mb-1.5 block text-[13px] font-medium text-foreground">
          {label}
        </label>
        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy}
            className={cn(
              "auth-input h-11 w-full rounded-[10px] border border-input bg-transparent px-3 text-sm text-foreground placeholder:text-muted-foreground/70",
              "transition-[border-color,box-shadow] duration-150 motion-reduce:transition-none",
              "hover:border-muted-foreground/40 focus:border-foreground/40 focus:shadow-[0_0_0_3px_rgb(var(--foreground)/0.06)] focus:outline-none",
              "aria-[invalid=true]:border-destructive aria-[invalid=true]:focus:shadow-[0_0_0_3px_rgb(var(--destructive)/0.12)]",
              trailing ? "pr-16" : undefined
            )}
            {...props}
          />
          {trailing ? <div className="absolute inset-y-0 right-1 flex items-center">{trailing}</div> : null}
        </div>
        {error ? (
          <p id={`${inputId}-error`} className="mt-1.5 flex items-center gap-1.5 text-[13px] text-destructive">
            <AppIcon icon={Alert02Icon} size={14} />
            {error}
          </p>
        ) : success ? (
          <p id={`${inputId}-hint`} className="mt-1.5 flex items-center gap-1.5 text-[13px] text-primary" aria-live="polite">
            <AppIcon icon={CheckmarkCircle02Icon} size={14} />
            {success}
          </p>
        ) : hint ? (
          <p id={`${inputId}-hint`} className="mt-1.5 text-[13px] text-muted-foreground">
            {hint}
          </p>
        ) : null}
      </div>
    );
  }
);
AuthField.displayName = "AuthField";

/** Text "Show"/"Hide" toggle for password fields; clearer than an eye icon. */
export function PasswordToggle({ visible, onToggle }: { visible: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={visible ? "Hide password" : "Show password"}
      aria-pressed={visible}
      className="h-8 rounded-[6px] px-2.5 text-[13px] font-medium text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {visible ? "Hide" : "Show"}
    </button>
  );
}

/** Four-segment strength bar. Heuristic only: length and character variety. */
export function PasswordStrength({ value }: { value: string }) {
  if (!value) return null;
  const score = [
    value.length >= 8,
    /[a-z]/.test(value) && /[A-Z]/.test(value),
    /\d/.test(value),
    /[^A-Za-z0-9]/.test(value) || value.length >= 12
  ].filter(Boolean).length;
  const labels = ["Too weak", "Weak", "Okay", "Good", "Strong"];
  const tone = score <= 1 ? "bg-destructive" : score === 2 ? "bg-amber-500" : "bg-primary";

  return (
    <div className="mt-2" aria-live="polite">
      <div className="flex gap-1" aria-hidden>
        {Array.from({ length: 4 }).map((_, index) => (
          <span
            key={index}
            className={cn(
              "h-1 flex-1 rounded-full transition-colors duration-200 motion-reduce:transition-none",
              index < score ? tone : "bg-secondary"
            )}
          />
        ))}
      </div>
      <p className="mt-1 text-[12px] text-muted-foreground">Password strength: {labels[score]}</p>
    </div>
  );
}

/** Inline form-level error, softer than a toast and next to the action. */
export function AuthAlert({ children }: { children: React.ReactNode }) {
  return (
    <div role="alert" className="flex gap-2.5 rounded-[10px] bg-destructive/10 px-3 py-2.5 text-[13px] leading-5 text-destructive">
      <AppIcon icon={Alert02Icon} size={16} className="mt-0.5" />
      <div className="min-w-0">{children}</div>
    </div>
  );
}

/** Google's four-colour "G". Brand colours are fixed by Google's guidelines, not theme tokens. */
function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  );
}

/**
 * "Continue with Google". Not wired up yet: clicking explains that rather than
 * doing nothing. Replace onClick with the OAuth redirect when it lands.
 */
export function GoogleButton() {
  return (
    <button
      type="button"
      onClick={() => gooeyToast.info("Google sign-in is coming soon.")}
      className="flex h-11 w-full items-center justify-center gap-2.5 rounded-[10px] border border-input bg-transparent text-sm font-medium text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <GoogleMark />
      Continue with Google
    </button>
  );
}

/** Hairline divider with a centred "or". */
export function AuthDivider() {
  return (
    <div className="my-6 flex items-center gap-3 text-[12px] text-muted-foreground" role="separator">
      <span className="h-px flex-1 bg-border" />
      or
      <span className="h-px flex-1 bg-border" />
    </div>
  );
}

/** Small ring spinner for inline field status. */
export function FieldSpinner({ label = "Checking" }: { label?: string }) {
  return (
    <span role="status" aria-label={label} className="grid size-8 place-items-center">
      <span className="size-4 animate-spin rounded-full border-2 border-muted-foreground/25 border-t-muted-foreground motion-reduce:animate-none" />
    </span>
  );
}
