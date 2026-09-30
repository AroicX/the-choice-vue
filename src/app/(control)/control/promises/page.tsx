"use client";

import { AdminApiResourcePage } from "@/components/admin/admin-api-resource-page";
import { mapPromise, promisePayload, promisesMeta } from "@/components/admin/admin-record-mappers";
import { promisesService } from "@/services/civic-content.service";

export default function ControlPromisesPage() {
  return (
    <AdminApiResourcePage
      meta={promisesMeta}
      queryKey={["control", "promises"]}
      queryFn={() => promisesService.listAll()}
      mapRecord={mapPromise}
      createFn={(payload) => promisesService.create(payload)}
      updateFn={(id, payload) => promisesService.update(id, payload)}
      deleteFn={(id) => promisesService.remove(id)}
      createPayload={(payload) => promisePayload(payload)}
      updatePayload={(payload, record) => promisePayload(payload, record)}
    />
  );
}
