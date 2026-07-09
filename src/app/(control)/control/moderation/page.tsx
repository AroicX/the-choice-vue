"use client";

import { AdminApiResourcePage } from "@/components/admin/admin-api-resource-page";
import { mapReport, moderationMeta, omitEmpty } from "@/components/admin/admin-record-mappers";
import { moderationService } from "@/services/moderation.service";

const actionMap: Record<string, string> = {
  Dismiss: "RESTORE_CONTENT",
  "Remove Content": "REMOVE_CONTENT",
  "Warn User": "WARN_USER",
  "Suspend User": "SUSPEND_USER",
  Escalate: "ESCALATE"
};

export default function ControlModerationPage() {
  return (
    <AdminApiResourcePage
      meta={moderationMeta}
      queryKey={["control", "moderation", "reports"]}
      queryFn={() => moderationService.reports({ take: 50 })}
      mapRecord={mapReport}
      createFn={(payload) => moderationService.createAction(payload)}
      createPayload={omitEmpty}
      customAction={(action, record) => {
        const moderationAction = actionMap[action];
        if (!moderationAction) return undefined;
        return moderationService.createAction({
          targetId: record.values.target,
          targetType: record.values.type,
          action: moderationAction,
          reason: `${action} from control panel`
        });
      }}
    />
  );
}
