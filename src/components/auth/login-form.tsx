"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { gooeyToast } from "goey-toast";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { AppIcon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ViewIcon, ViewOffIcon } from "@/lib/icons";
import { loginMutation } from "@/services/mutations/auth.mutations";
import { useAuthStore } from "@/stores/auth-store";

const schema = z.object({
  identifier: z.string().min(3, "Email or phone number is required"),
  password: z.string().min(6, "Password must be at least 6 characters")
});

type LoginFormValues = z.infer<typeof schema>;

const controlRedirectRoles = new Set(["ADMIN", "SUPER_ADMIN"]);

type LoginFormProps = {
  onSuccess?: () => void;
  showLinks?: boolean;
};

export function LoginForm({ onSuccess, showLinks = true }: LoginFormProps) {
  const router = useRouter();
  const setSession = useAuthStore((state) => state.setSession);
  const [showPassword, setShowPassword] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({ resolver: zodResolver(schema) });
  const login = useMutation({
    mutationFn: loginMutation,
    onSuccess: ({ token, user }) => {
      setSession({ token, user });
      gooeyToast.success("Welcome back", { description: "You are signed in to Choice9ja." });
      onSuccess?.();
      if (controlRedirectRoles.has(user.role)) {
        router.replace("/control");
      }
    },
    onError: (error) => {
      gooeyToast.error("Login failed", { description: error instanceof Error ? error.message : "Check your details and try again." });
    }
  });

  function onSubmit(values: LoginFormValues) {
    const isEmail = values.identifier.includes("@");
    login.mutate({ password: values.password, ...(isEmail ? { email: values.identifier } : { phoneNo: values.identifier }) });
  }

  return (
    <div>
      <div className="mb-6">
        <img src="/legacy/logo.png" alt="Choice9ja" className="size-16 rounded-xl object-contain" />
        <h2 className="mt-5 text-2xl font-bold">Log in to TheChoice9ja</h2>
        <p className="mt-2 text-sm text-muted-foreground">Use email or phone number to continue.</p>
      </div>
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <Field label="Email or phone" error={errors.identifier?.message}>
          <Input {...register("identifier")} placeholder="you@example.com" autoComplete="username" />
        </Field>
        <Field label="Password" error={errors.password?.message}>
          <div className="relative">
            <Input
              {...register("password")}
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              autoComplete="current-password"
              className="pr-11"
            />
            <button
              type="button"
              className="absolute right-2 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-md text-muted-foreground transition hover:bg-accent hover:text-foreground"
              aria-label={showPassword ? "Hide password" : "Show password"}
              onClick={() => setShowPassword((open) => !open)}
            >
              <AppIcon icon={showPassword ? ViewOffIcon : ViewIcon} size={18} />
            </button>
          </div>
        </Field>
        {login.error ? <p className="text-sm text-destructive">{login.error.message}</p> : null}
        <Button className="w-full" disabled={login.isPending}>
          {login.isPending ? "Logging in..." : "Continue"}
        </Button>
      </form>
      {showLinks ? (
        <div className="mt-5 flex justify-between text-sm">
          <Link className="text-primary hover:underline" href="/forgot-password">Forgot password?</Link>
          <Link className="text-primary hover:underline" href="/register">Create account</Link>
        </div>
      ) : null}
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-2 text-sm font-medium">
      <span>{label}</span>
      {children}
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </label>
  );
}
