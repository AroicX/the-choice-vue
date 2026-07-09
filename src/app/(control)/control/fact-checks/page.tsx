"use client";

import { AdminApiResourcePage } from "@/components/admin/admin-api-resource-page";
import { factChecksMeta, factCheckPayload, mapFactCheck } from "@/components/admin/admin-record-mappers";
import { factChecksService } from "@/services/civic-content.service";

export default function ControlFactChecksPage() {
  return (
    <AdminApiResourcePage
      meta={factChecksMeta}
      queryKey={["control", "fact-checks"]}
      queryFn={() => factChecksService.list()}
      mapRecord={mapFactCheck}
      createFn={(payload) => factChecksService.create(payload)}
      updateFn={(id, payload) => factChecksService.update(id, payload)}
      deleteFn={(id) => factChecksService.remove(id)}
      createPayload={(payload) => factCheckPayload(payload)}
      updatePayload={(payload) => factCheckPayload(payload)}
    />
  );
}
