"use client";

import { AdminApiResourcePage } from "@/components/admin/admin-api-resource-page";
import { commentsMeta, mapComment, omitEmpty } from "@/components/admin/admin-record-mappers";
import { commentsService } from "@/services/comments.service";

export default function ControlCommentsPage() {
  return (
    <AdminApiResourcePage
      meta={commentsMeta}
      queryKey={["control", "comments"]}
      queryFn={() => commentsService.list()}
      mapRecord={mapComment}
      createFn={(payload) => commentsService.create(String(payload.postId), { message: payload.message })}
      updateFn={(id, payload) => commentsService.update(id, payload)}
      deleteFn={(id) => commentsService.remove(id)}
      createPayload={omitEmpty}
      updatePayload={omitEmpty}
    />
  );
}
