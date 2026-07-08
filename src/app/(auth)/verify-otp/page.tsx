import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function VerifyOtpPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardContent className="space-y-4 p-6">
          <h1 className="text-2xl font-bold">Verify OTP</h1>
          <Input placeholder="Reference ID" />
          <Input placeholder="123456" />
          <Button className="w-full">Verify</Button>
        </CardContent>
      </Card>
    </main>
  );
}
