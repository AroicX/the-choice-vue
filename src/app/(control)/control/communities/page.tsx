"use client";

import { AdminApiResourcePage } from "@/components/admin/admin-api-resource-page";
import { communitiesMeta, mapCommunity, omitEmpty } from "@/components/admin/admin-record-mappers";
import { communitiesService } from "@/services/civic-content.service";

export default function ControlCommunitiesPage() {
  return (
    <AdminApiResourcePage
      meta={communitiesMeta}
      queryKey={["control", "communities"]}
      queryFn={() => communitiesService.list()}
      mapRecord={mapCommunity}
      createFn={(payload) => communitiesService.create(omitEmpty(payload as Record<string, string | boolean>))}
      updateFn={(id, payload) => communitiesService.update(id, omitEmpty(payload as Record<string, string | boolean>))}
      deleteFn={(id) => communitiesService.remove(id)}
    />
  );
}
