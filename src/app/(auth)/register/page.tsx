import { RegisterForm } from "@/components/auth/register-form";
import { Card, CardContent } from "@/components/ui/card";

export default function RegisterPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-background px-4 py-10">
      <Card className="w-full max-w-xl border-border shadow-sm">
        <CardContent className="p-6 sm:p-8">
          <RegisterForm />
        </CardContent>
      </Card>
    </main>
  );
}
