"use client";

import { AdminApiResourcePage } from "@/components/admin/admin-api-resource-page";
import { mapPost, omitEmpty, postsMeta } from "@/components/admin/admin-record-mappers";
import { postsService } from "@/services/posts.service";

export default function ControlPostsPage() {
  return (
    <AdminApiResourcePage
      meta={postsMeta}
      queryKey={["control", "posts"]}
      queryFn={() => postsService.list({ take: 50 })}
      mapRecord={mapPost}
      createFn={(payload) => postsService.create(payload)}
      deleteFn={(id) => postsService.remove(id)}
      createPayload={omitEmpty}
    />
  );
}
