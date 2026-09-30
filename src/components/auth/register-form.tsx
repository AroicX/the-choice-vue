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
import { AuthDivider, AuthField, FieldSpinner, GoogleButton, PasswordStrength, PasswordToggle } from "@/components/auth/auth-field";
import { useUsernameAvailability } from "@/hooks/use-username-availability";
import { AuthHeading } from "@/components/auth/auth-shell";
import { signupMutation } from "@/services/mutations/auth.mutations";
import { useAuthStore } from "@/stores/auth-store";
import { AuthError } from "@/components/auth/auth-error";

const schema = z.object({
  firstName: z.string().trim().min(1, "Enter your first name"),
  lastName: z.string().trim().min(1, "Enter your last name"),
  username: z.string().trim().min(3, "At least 3 characters"),
  phoneNo: z.string().trim().min(7, "Enter a valid phone number"),
  email: z.string().trim().email("Enter a valid email"),
  password: z.string().min(6, "At least 6 characters")
});

type RegisterFormValues = z.infer<typeof schema>;

export function RegisterForm() {
  const router = useRouter();
  const setSession = useAuthStore((state) => state.setSession);
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm<RegisterFormValues>({ resolver: zodResolver(schema) });
  const password = watch("password") ?? "";
  const username = (watch("username") ?? "").trim().replace(/^@+/, "");
  const usernameStatus = useUsernameAvailability(username);
  const usernameTaken = usernameStatus === "taken";

  const signup = useMutation({
    mutationFn: signupMutation,
    onSuccess: ({ token, user }) => {
      setSession({ token, user });
      gooeyToast.success("Welcome to Choice9ja");
      router.replace("/home");
    }
    // Failures render inline next to the button.
  });

  return (
    <div>
      <AuthHeading title="Create your account" subtitle="Rate leaders, report issues and vote in polls." />

      <GoogleButton />
      <AuthDivider />

      <form
        className="space-y-4"
        onSubmit={handleSubmit((values) => {
          // The API would reject it anyway; the message is already on screen.
          if (usernameTaken) return;
          signup.mutate(values);
        })}
        noValidate
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <AuthField {...register("firstName")} label="First name" autoComplete="given-name" error={errors.firstName?.message} />
          <AuthField {...register("lastName")} label="Last name" autoComplete="family-name" error={errors.lastName?.message} />
        </div>
        <AuthField
          {...register("username")}
          label="Username"
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          hint="Your public @handle."
          error={errors.username?.message ?? (usernameTaken ? `@${username} is taken` : undefined)}
          success={usernameStatus === "available" ? `@${username} is available` : undefined}
          trailing={usernameStatus === "checking" ? <FieldSpinner label="Checking username" /> : undefined}
        />
        <AuthField {...register("email")} label="Email" type="email" autoComplete="email" error={errors.email?.message} />
        <AuthField
          {...register("phoneNo")}
          label="Phone number"
          type="tel"
          autoComplete="tel"
          inputMode="tel"
          error={errors.phoneNo?.message}
        />
        <div>
          <AuthField
            {...register("password")}
            label="Password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            error={errors.password?.message}
            trailing={<PasswordToggle visible={showPassword} onToggle={() => setShowPassword((open) => !open)} />}
          />
          <PasswordStrength value={password} />
        </div>

        {signup.error ? <AuthError error={signup.error} /> : null}

        <Button className="!mt-6 h-11 w-full" disabled={signup.isPending}>
          {signup.isPending ? "Creating account…" : "Create account"}
        </Button>
      </form>

      <p className="mt-8 text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-foreground underline-offset-4 hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
