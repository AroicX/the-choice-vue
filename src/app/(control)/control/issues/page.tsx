"use client";

import { AdminApiResourcePage } from "@/components/admin/admin-api-resource-page";
import { issuesMeta, mapIssue, omitEmpty } from "@/components/admin/admin-record-mappers";
import { issuesService } from "@/services/civic-content.service";

export default function ControlIssuesPage() {
  return (
    <AdminApiResourcePage
      meta={issuesMeta}
      queryKey={["control", "issues"]}
      queryFn={() => issuesService.list()}
      mapRecord={mapIssue}
      createFn={(payload) => issuesService.create(omitEmpty(payload as Record<string, string | boolean>))}
      updateFn={(id, payload) => issuesService.update(id, omitEmpty(payload as Record<string, string | boolean>))}
      deleteFn={(id) => issuesService.remove(id)}
    />
  );
}
