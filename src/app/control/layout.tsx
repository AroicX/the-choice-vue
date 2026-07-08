import { AdminGuard } from "@/components/auth/admin-guard";
import { ControlShell } from "@/components/layout/control-shell";

export default function ControlLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminGuard>
      <ControlShell>{children}</ControlShell>
    </AdminGuard>
  );
}
