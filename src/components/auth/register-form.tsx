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
import { signupMutation } from "@/services/mutations/auth.mutations";
import { useAuthStore } from "@/stores/auth-store";

const schema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  phoneNo: z.string().min(7, "Enter a valid phone number"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters")
});

type RegisterFormValues = z.infer<typeof schema>;

export function RegisterForm() {
  const router = useRouter();
  const setSession = useAuthStore((state) => state.setSession);
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<RegisterFormValues>({ resolver: zodResolver(schema) });

  const signup = useMutation({
    mutationFn: signupMutation,
    onSuccess: ({ token, user }) => {
      setSession({ token, user });
      gooeyToast.success("Account created", { description: "Welcome to TheChoice9ja." });
      router.replace("/");
    },
    onError: (error) => {
      gooeyToast.error("Signup failed", {
        description: error instanceof Error ? error.message : "Check your details and try again."
      });
    }
  });

  function onSubmit(values: RegisterFormValues) {
    signup.mutate(values);
  }

  return (
    <div>
      <div className="mb-8">
        <img src="/legacy/logo.png" alt="Choice9ja" className="size-14 rounded-xl object-contain sm:size-16" />
        <h1 className="mt-5 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Create account</h1>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
          Sign up to report issues, vote in polls, and follow civic performance.
        </p>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="First name" error={errors.firstName?.message}>
            <Input {...register("firstName")} placeholder="Ada" autoComplete="given-name" />
          </Field>
          <Field label="Last name" error={errors.lastName?.message}>
            <Input {...register("lastName")} placeholder="Okafor" autoComplete="family-name" />
          </Field>
        </div>

        <Field label="Username" error={errors.username?.message}>
          <Input {...register("username")} placeholder="adaokafor" autoComplete="username" />
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Phone number" error={errors.phoneNo?.message}>
            <Input {...register("phoneNo")} type="tel" placeholder="+234 800 000 0000" autoComplete="tel" />
          </Field>
          <Field label="Email" error={errors.email?.message}>
            <Input {...register("email")} type="email" placeholder="you@example.com" autoComplete="email" />
          </Field>
        </div>

        <Field label="Password" error={errors.password?.message}>
          <div className="relative">
            <Input
              {...register("password")}
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              autoComplete="new-password"
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

        {signup.error ? <p className="text-sm text-destructive">{signup.error.message}</p> : null}

        <Button className="mt-2 h-11 w-full text-sm font-semibold" disabled={signup.isPending}>
          {signup.isPending ? "Creating account..." : "Create account"}
        </Button>
      </form>

      <p className="mt-8 border-t border-border pt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link className="font-medium text-primary hover:underline" href="/login">
          Log in
        </Link>
      </p>
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-2 text-sm font-medium text-foreground">
      <span>{label}</span>
      {children}
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </label>
  );
}
