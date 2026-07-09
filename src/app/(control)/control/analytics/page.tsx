"use client";

import { AdminApiResourcePage } from "@/components/admin/admin-api-resource-page";
import { analyticsMeta, mapAnalytics } from "@/components/admin/admin-record-mappers";
import { analyticsService } from "@/services/analytics.service";

function flattenMetrics(payload: unknown) {
  const source = payload && typeof payload === "object" && "data" in payload ? (payload as { data: unknown }).data : payload;
  if (!source || typeof source !== "object") return [];
  return Object.entries(source as Record<string, unknown>).map(([metric, value]) => ({ id: metric, metric, value, source: "Analytics" }));
}

export default function ControlAnalyticsPage() {
  return (
    <AdminApiResourcePage
      meta={analyticsMeta}
      queryKey={["control", "analytics"]}
      queryFn={async () => flattenMetrics(await analyticsService.overview())}
      mapRecord={mapAnalytics}
    />
  );
}
