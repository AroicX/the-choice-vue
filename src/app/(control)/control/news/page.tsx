"use client";

import { AdminApiResourcePage } from "@/components/admin/admin-api-resource-page";
import { mapNews, newsMeta, newsPayload } from "@/components/admin/admin-record-mappers";
import { newsService } from "@/services/civic-content.service";

export default function ControlNewsPage() {
  return (
    <AdminApiResourcePage
      meta={newsMeta}
      queryKey={["control", "news"]}
      queryFn={() => newsService.listAll()}
      mapRecord={mapNews}
      createFn={(payload) => newsService.create(payload)}
      updateFn={(id, payload) => newsService.update(id, payload)}
      deleteFn={(id) => newsService.remove(id)}
      createPayload={(payload) => newsPayload(payload)}
      updatePayload={(payload) => newsPayload(payload)}
    />
  );
}
