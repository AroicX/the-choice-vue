"use client";

import { AdminApiResourcePage } from "@/components/admin/admin-api-resource-page";
import { mapPoll, pollCreatePayload, pollPayload, pollsMeta } from "@/components/admin/admin-record-mappers";
import { pollsService } from "@/services/polls.service";

export default function ControlPollsPage() {
  return (
    <AdminApiResourcePage
      meta={pollsMeta}
      queryKey={["control", "polls"]}
      queryFn={() => pollsService.list({ take: 50 })}
      mapRecord={mapPoll}
      createFn={(payload) => {
        const { discussionId, ...body } = payload;
        return pollsService.create(String(discussionId), body);
      }}
      updateFn={(id, payload) => pollsService.update(id, payload)}
      deleteFn={(id) => pollsService.remove(id)}
      createPayload={pollCreatePayload}
      updatePayload={pollPayload}
    />
  );
}
