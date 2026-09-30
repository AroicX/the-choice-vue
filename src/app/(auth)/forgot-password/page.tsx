import Link from "next/link";
import { AuthField } from "@/components/auth/auth-field";
import { AuthHeading, AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";

// TODO: not wired to the API yet (POST /auth/forgot-password); submitting does nothing.
export default function ForgotPasswordPage() {
  return (
    <AuthShell>
      <AuthHeading title="Reset your password" subtitle="Enter your email or phone number and we’ll send you a code." />
      <form className="space-y-4">
        <AuthField name="identifier" label="Email or phone number" autoComplete="username" autoCapitalize="none" />
        <Button className="!mt-6 h-11 w-full">
          Send code
        </Button>
      </form>
      <p className="mt-8 text-sm text-muted-foreground">
        Remembered it?{" "}
        <Link href="/login" className="font-medium text-foreground underline-offset-4 hover:underline">
          Back to log in
        </Link>
      </p>
    </AuthShell>
  );
}
