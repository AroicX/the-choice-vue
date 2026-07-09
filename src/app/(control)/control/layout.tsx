import { AdminGuard } from "@/components/auth/admin-guard";
import { AdminLayout } from "@/components/admin/admin-shell";

export default function ControlLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminGuard>
      <AdminLayout>{children}</AdminLayout>
    </AdminGuard>
  );
}
