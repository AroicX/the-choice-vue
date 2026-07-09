import { notFound } from "next/navigation";
import { AdminResourcePage } from "@/components/admin/admin-resource-page";
import { adminResources, getAdminResource } from "@/lib/admin-control-data";

export function generateStaticParams() {
  return adminResources.map((resource) => ({ resource: resource.slug }));
}

export default function ControlResourcePage({ params }: { params: { resource: string } }) {
  const config = getAdminResource(params.resource);

  if (!config) {
    notFound();
  }

  return <AdminResourcePage config={config} />;
}
