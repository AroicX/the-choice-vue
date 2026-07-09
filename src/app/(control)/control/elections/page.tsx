"use client";

import { AdminApiResourcePage } from "@/components/admin/admin-api-resource-page";
import { electionPayload, electionsMeta, mapElection } from "@/components/admin/admin-record-mappers";
import { electionsService } from "@/services/elections.service";

export default function ControlElectionsPage() {
  return (
    <AdminApiResourcePage
      meta={electionsMeta}
      queryKey={["control", "elections"]}
      queryFn={() => electionsService.list({ take: 50 })}
      mapRecord={mapElection}
      createFn={(payload) => electionsService.create(payload)}
      updateFn={(id, payload) => electionsService.update(id, payload)}
      deleteFn={(id) => electionsService.remove(id)}
      createPayload={electionPayload}
      updatePayload={electionPayload}
    />
  );
}
