"use client";

import { AdminApiResourcePage } from "@/components/admin/admin-api-resource-page";
import { mapParty, omitEmpty, partiesMeta } from "@/components/admin/admin-record-mappers";
import { partiesService } from "@/services/parties.service";

export default function ControlPartiesPage() {
  return (
    <AdminApiResourcePage
      meta={partiesMeta}
      queryKey={["control", "parties"]}
      queryFn={() => partiesService.list()}
      mapRecord={mapParty}
      createFn={(payload) => partiesService.create(payload)}
      updateFn={(id, payload) => partiesService.update(id, payload)}
      deleteFn={(id) => partiesService.remove(id)}
      createPayload={omitEmpty}
      updatePayload={omitEmpty}
    />
  );
}
