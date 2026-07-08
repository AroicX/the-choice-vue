import { notFound } from "next/navigation";
import { AdminResourceManager } from "@/components/control/admin-resource-manager";
import { getAdminResource } from "@/lib/admin-resources";

export default function ControlSectionPage({ params }: { params: { section: string } }) {
  const resource = getAdminResource(params.section);

  if (!resource) notFound();

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">{resource.label}</h1>
          <p className="mt-2 text-muted-foreground">Manage records, filters, operational actions, and full CRUD payloads for {resource.label.toLowerCase()}.</p>
        </div>
      </div>
      <AdminResourceManager resource={resource} />
    </div>
  );
}
