import { AdminLayout } from "@/components/admin/admin-shell";

export function ControlShell({ children }: { children: React.ReactNode }) {
  return <AdminLayout>{children}</AdminLayout>;
}
