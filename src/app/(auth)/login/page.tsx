"use client";

import { useRouter } from "next/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";
import { useAuthStore } from "@/stores/auth-store";

export default function LoginPage() {
  const router = useRouter();

  return (
    <AuthShell>
      <LoginForm
        onSuccess={() => {
          const role = useAuthStore.getState().user?.role;
          if (role === "ADMIN" || role === "SUPER_ADMIN") return;
          router.push("/");
        }}
      />
    </AuthShell>
  );
}
