"use client";

import { AdminApiResourcePage } from "@/components/admin/admin-api-resource-page";
import { settingsMeta } from "@/components/admin/admin-record-mappers";

export default function ControlSettingsPage() {
  return (
    <AdminApiResourcePage
      meta={settingsMeta}
      queryKey={["control", "settings"]}
      queryFn={() => Promise.resolve([])}
      mapRecord={(record) => ({
        id: String(record.id),
        title: String(record.setting ?? "Setting"),
        values: record as Record<string, string>,
        details: Object.entries(record).map(([label, value]) => ({ label, value: String(value) }))
      })}
    />
  );
}
