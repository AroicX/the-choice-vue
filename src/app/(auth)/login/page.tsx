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
              const user = useAuthStore.getState().user;
              router.push(
                user && ["ADMIN", "SUPER_ADMIN"].includes(user.role)
                  ? "/control/dashboard"
                  : user?.role === "MODERATOR"
                    ? "/control/moderation"
                    : "/home"
              );
            }}
          />
        </CardContent>
      </Card>
    </main>
  );
}
