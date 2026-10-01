import { AuthField } from "@/components/auth/auth-field";
import { AuthHeading, AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";

// TODO: not wired to the API yet (POST /auth/reset-password); submitting does nothing.
export default function ResetPasswordPage() {
  return (
    <AuthShell>
      <AuthHeading title="Choose a new password" subtitle="Make it at least 8 characters, and don’t reuse an old one." />
      <form className="space-y-4">
        <AuthField name="email" label="Email" type="email" autoComplete="email" />
        <AuthField name="password" label="New password" type="password" autoComplete="new-password" />
        <AuthField name="confirmPassword" label="Confirm new password" type="password" autoComplete="new-password" />
        <Button className="!mt-6 h-11 w-full rounded-[10px]">
          Update password
        </Button>
      </form>
    </AuthShell>
  );
}
