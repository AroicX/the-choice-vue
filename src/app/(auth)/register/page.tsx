import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function RegisterPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-background px-4">
      <Card className="w-full max-w-lg">
        <CardContent className="p-6">
          <h1 className="text-2xl font-bold">Create account</h1>
          <p className="mt-2 text-sm text-muted-foreground">Sign up to report issues, vote in polls, and follow civic performance.</p>
          <form className="mt-6 grid gap-4 md:grid-cols-2">
            <Input placeholder="First name" />
            <Input placeholder="Last name" />
            <Input placeholder="Username" />
            <Input placeholder="Phone number" />
            <Input className="md:col-span-2" placeholder="Email" />
            <Input className="md:col-span-2" type="password" placeholder="Password" />
            <Button className="md:col-span-2">Create account</Button>
          </form>
          <p className="mt-5 text-sm text-muted-foreground">Already have an account? <Link className="text-primary" href="/login">Log in</Link></p>
        </CardContent>
      </Card>
    </main>
  );
}
