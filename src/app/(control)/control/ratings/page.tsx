"use client";

import { AdminApiResourcePage } from "@/components/admin/admin-api-resource-page";
import { mapRating, omitEmpty, ratingsMeta } from "@/components/admin/admin-record-mappers";
import { ratingsService } from "@/services/ratings.service";

export default function ControlRatingsPage() {
  return (
    <AdminApiResourcePage
      meta={ratingsMeta}
      queryKey={["control", "ratings"]}
      queryFn={() => ratingsService.list({ take: 50 })}
      mapRecord={mapRating}
      createFn={(payload) => ratingsService.create(payload)}
      updateFn={(_, payload) => ratingsService.update(payload)}
      deleteFn={(id) => ratingsService.remove(id)}
      createPayload={omitEmpty}
      updatePayload={omitEmpty}
    />
  );
}
