"use client";

import { AdminApiResourcePage } from "@/components/admin/admin-api-resource-page";
import { discussionsMeta, mapDiscussion, omitEmpty } from "@/components/admin/admin-record-mappers";
import { discussionsService } from "@/services/discussions.service";

export default function ControlDiscussionsPage() {
  return (
    <AdminApiResourcePage
      meta={discussionsMeta}
      queryKey={["control", "discussions"]}
      queryFn={() => discussionsService.list()}
      mapRecord={mapDiscussion}
      createFn={(payload) => discussionsService.create(payload)}
      updateFn={(id, payload) => discussionsService.update(id, payload)}
      deleteFn={(id) => discussionsService.remove(id)}
      createPayload={omitEmpty}
      updatePayload={omitEmpty}
    />
  );
}
