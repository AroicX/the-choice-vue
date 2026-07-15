import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function RegisterPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-background px-4 py-10">
      <Card className="w-full max-w-xl border-border shadow-sm">
        <CardContent className="p-6 sm:p-8">
          <div className="mb-8">
            <img src="/legacy/logo.png" alt="Choice9ja" className="size-14 rounded-xl object-contain sm:size-16" />
            <h1 className="mt-5 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Create account</h1>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
              Sign up to report issues, vote in polls, and follow civic performance.
            </p>
          </div>

          <form className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="First name">
                <Input placeholder="Ada" autoComplete="given-name" />
              </Field>
              <Field label="Last name">
                <Input placeholder="Okafor" autoComplete="family-name" />
              </Field>
            </div>

            <Field label="Username">
              <Input placeholder="adaokafor" autoComplete="username" />
            </Field>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Phone number">
                <Input type="tel" placeholder="+234 800 000 0000" autoComplete="tel" />
              </Field>
              <Field label="Email">
                <Input type="email" placeholder="you@example.com" autoComplete="email" />
              </Field>
            </div>

            <Field label="Password">
              <Input type="password" placeholder="••••••••" autoComplete="new-password" />
            </Field>

            <Button className="mt-2 h-11 w-full text-sm font-semibold">Create account</Button>
          </form>

          <p className="mt-8 border-t border-border pt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link className="font-medium text-primary hover:underline" href="/login">
              Log in
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-2 text-sm font-medium text-foreground">
      <span>{label}</span>
      {children}
    </label>
  );
}
