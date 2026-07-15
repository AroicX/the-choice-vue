"use client";

import { useRouter } from "next/navigation";
import { LoginForm } from "@/components/auth/login-form";
import { Card, CardContent } from "@/components/ui/card";
import { useAuthStore } from "@/stores/auth-store";

export default function LoginPage() {
  const router = useRouter();

  return (
    <main className="grid min-h-screen place-items-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-6">
          <LoginForm
            onSuccess={() => {
              const role = useAuthStore.getState().user?.role;
              if (role === "ADMIN" || role === "SUPER_ADMIN") return;
              router.push("/");
            }}
          />
        </CardContent>
      </Card>
    </main>
  );
}
