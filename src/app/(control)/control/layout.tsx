import { AdminGuard } from "@/components/auth/admin-guard";
import { AdminLayout } from "@/components/admin/admin-shell";
import { QueryProvider } from "@/components/providers/query-provider";

export default function ControlLayout({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <AdminGuard>
        <AdminLayout>{children}</AdminLayout>
      </AdminGuard>
    </QueryProvider>
  );
}
