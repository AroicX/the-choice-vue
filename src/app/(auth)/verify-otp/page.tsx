import { AuthField } from "@/components/auth/auth-field";
import { AuthHeading, AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";

// TODO: not wired to the API yet (PATCH /auth/validate-otp); submitting does nothing.
export default function VerifyOtpPage() {
  return (
    <AuthShell>
      <AuthHeading title="Enter your code" subtitle="We sent a 6-digit code to your phone." />
      <form className="space-y-4">
        <AuthField name="reference" label="Reference ID" autoCapitalize="none" spellCheck={false} />
        <AuthField
          name="otp"
          label="6-digit code"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          className="[&_input]:tracking-[0.3em]"
        />
        <Button className="!mt-6 h-11 w-full rounded-[10px]">
          Verify
        </Button>
      </form>
    </AuthShell>
  );
}
