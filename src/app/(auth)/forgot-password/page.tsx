import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function ForgotPasswordPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-6">
          <h1 className="text-2xl font-bold">Reset password</h1>
          <p className="mt-2 text-sm text-muted-foreground">Enter your email or phone number to receive an OTP.</p>
          <form className="mt-6 space-y-4">
            <Input placeholder="Email or phone number" />
            <Button className="w-full">Send OTP</Button>
          </form>
          <Link href="/login" className="mt-5 block text-sm text-primary">Back to login</Link>
        </CardContent>
      </Card>
    </main>
  );
}
