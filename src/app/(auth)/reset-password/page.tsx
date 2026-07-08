import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function ResetPasswordPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardContent className="space-y-4 p-6">
          <h1 className="text-2xl font-bold">Choose new password</h1>
          <Input placeholder="Email" />
          <Input type="password" placeholder="New password" />
          <Input type="password" placeholder="Confirm password" />
          <Button className="w-full">Update password</Button>
        </CardContent>
      </Card>
    </main>
  );
}
