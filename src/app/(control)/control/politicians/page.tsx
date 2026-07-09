"use client";

import { AdminApiResourcePage } from "@/components/admin/admin-api-resource-page";
import { mapPolitician, omitEmpty, politiciansMeta } from "@/components/admin/admin-record-mappers";
import { politiciansService } from "@/services/politicians.service";

export default function ControlPoliticiansPage() {
  return (
    <AdminApiResourcePage
      meta={politiciansMeta}
      queryKey={["control", "politicians"]}
      queryFn={() => politiciansService.list()}
      mapRecord={mapPolitician}
      createFn={(payload) => politiciansService.create(payload)}
      updateFn={(id, payload) => politiciansService.update(id, payload)}
      deleteFn={(id) => politiciansService.remove(id)}
      createPayload={omitEmpty}
      updatePayload={omitEmpty}
    />
  );
}
