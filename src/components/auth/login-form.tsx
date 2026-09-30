"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { gooeyToast } from "goey-toast";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { AuthDivider, AuthField, GoogleButton, PasswordToggle } from "@/components/auth/auth-field";
import { AuthHeading } from "@/components/auth/auth-shell";
import { loginMutation } from "@/services/mutations/auth.mutations";
import { useAuthStore } from "@/stores/auth-store";
import { AuthError } from "@/components/auth/auth-error";

const schema = z.object({
  identifier: z.string().trim().min(3, "Enter your email or phone number"),
  password: z.string().min(6, "Password must be at least 6 characters")
});

type LoginFormValues = z.infer<typeof schema>;

const controlRedirectRoles = new Set(["ADMIN", "SUPER_ADMIN"]);

type LoginFormProps = {
  onSuccess?: () => void;
  onDismiss?: () => void;
  showLinks?: boolean;
  /** Replaces the default subtitle, e.g. with why sign-in is needed. */
  subtitle?: React.ReactNode;
};

export function LoginForm({ onSuccess, onDismiss, showLinks = true, subtitle }: LoginFormProps) {
  const router = useRouter();
  const setSession = useAuthStore((state) => state.setSession);
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginFormValues>({ resolver: zodResolver(schema) });
  const login = useMutation({
    mutationFn: loginMutation,
    onSuccess: ({ token, user }) => {
      setSession({ token, user });
      gooeyToast.success("Welcome back");
      onSuccess?.();
      if (controlRedirectRoles.has(user.role)) {
        router.replace("/control");
      }
    }
    // Failures render inline next to the button; a toast as well was noise.
  });

  function onSubmit(values: LoginFormValues) {
    const isEmail = values.identifier.includes("@");
    login.mutate({ password: values.password, ...(isEmail ? { email: values.identifier } : { phoneNo: values.identifier }) });
  }

  return (
    <div>
      <AuthHeading title="Welcome back" subtitle={subtitle ?? "Log in to rate, vote and join the conversation."} />

      <GoogleButton />
      <AuthDivider />

      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
        <AuthField
          {...register("identifier")}
          label="Email or phone number"
          autoComplete="username"
          inputMode="email"
          autoCapitalize="none"
          spellCheck={false}
          error={errors.identifier?.message}
        />
        <AuthField
          {...register("password")}
          label="Password"
          type={showPassword ? "text" : "password"}
          autoComplete="current-password"
          error={errors.password?.message}
          trailing={<PasswordToggle visible={showPassword} onToggle={() => setShowPassword((open) => !open)} />}
        />

        {showLinks ? (
          <div className="-mt-1 flex justify-end">
            <Link
              href="/forgot-password"
              onClick={onDismiss}
              className="rounded text-[13px] font-medium text-muted-foreground hover:text-foreground hover:underline"
            >
              Forgot password?
            </Link>
          </div>
        ) : null}

        {login.error ? <AuthError error={login.error} /> : null}

        <Button className="!mt-6 h-11 w-full" disabled={login.isPending}>
          {login.isPending ? "Logging in…" : "Log in"}
        </Button>
      </form>

      {showLinks ? (
        <p className="mt-8 text-sm text-muted-foreground">
          New to Choice9ja?{" "}
          <Link href="/register" onClick={onDismiss} className="font-medium text-foreground underline-offset-4 hover:underline">
            Create an account
          </Link>
        </p>
      ) : null}
    </div>
  );
}
