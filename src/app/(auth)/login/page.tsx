"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { gooeyToast } from "goey-toast";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { loginMutation } from "@/services/mutations/auth.mutations";
import { useAuthStore } from "@/stores/auth-store";

const schema = z.object({
  identifier: z.string().min(3, "Email or phone number is required"),
  password: z.string().min(6, "Password must be at least 6 characters")
});

type LoginForm = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const setSession = useAuthStore((state) => state.setSession);
  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({ resolver: zodResolver(schema) });
  const login = useMutation({
    mutationFn: loginMutation,
    onSuccess: ({ token, user }) => {
      setSession({ token, user });
      document.cookie = `choice9ja-role=${user.role}; path=/; max-age=604800; SameSite=Lax`;
      gooeyToast.success("Welcome back", { description: "You are signed in to Choice9ja." });
      router.push(["ADMIN", "SUPER_ADMIN"].includes(user.role) ? "/control/dashboard" : user.role === "MODERATOR" ? "/control/moderation" : "/home");
    },
    onError: (error) => {
      gooeyToast.error("Login failed", { description: error instanceof Error ? error.message : "Check your details and try again." });
    }
  });

  function onSubmit(values: LoginForm) {
    const isEmail = values.identifier.includes("@");
    login.mutate({ password: values.password, ...(isEmail ? { email: values.identifier } : { phoneNo: values.identifier }) });
  }

  return (
    <main className="grid min-h-screen place-items-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-6">
          <div className="mb-8">
            <div className="grid h-12 w-12 place-items-center rounded-md bg-primary text-xl font-bold text-primary-foreground">9</div>
            <h1 className="mt-5 text-2xl font-bold">Log in to TheChoice9ja</h1>
            <p className="mt-2 text-sm text-muted-foreground">Use email or phone number to continue.</p>
          </div>
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <Field label="Email or phone" error={errors.identifier?.message}><Input {...register("identifier")} placeholder="you@example.com" /></Field>
            <Field label="Password" error={errors.password?.message}><Input type="password" {...register("password")} placeholder="••••••••" /></Field>
            {login.error ? <p className="text-sm text-destructive">{login.error.message}</p> : null}
            <Button className="w-full" disabled={login.isPending}>{login.isPending ? "Logging in..." : "Continue"}</Button>
          </form>
          <div className="mt-5 flex justify-between text-sm">
            <Link className="text-primary" href="/forgot-password">Forgot password?</Link>
            <Link className="text-primary" href="/register">Create account</Link>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return <label className="block space-y-2 text-sm font-medium"><span>{label}</span>{children}{error ? <p className="text-xs text-destructive">{error}</p> : null}</label>;
}
