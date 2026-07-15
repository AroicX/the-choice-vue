"use client";

import { AdminApiResourcePage } from "@/components/admin/admin-api-resource-page";
import { mapUser, userPayload, usersMeta } from "@/components/admin/admin-record-mappers";
import { usersService } from "@/services/users.service";

export default function ControlUsersPage() {
  return (
    <AdminApiResourcePage
      meta={usersMeta}
      queryKey={["control", "users"]}
      queryFn={() => usersService.listUsers()}
      mapRecord={mapUser}
      createFn={(payload) => usersService.signup(payload)}
      updateFn={(id, payload) => usersService.updateUser(id, payload)}
      createPayload={userPayload}
      updatePayload={(payload) => userPayload(payload)}
      customAction={(action, record) => (action.toLowerCase().includes("suspend") ? usersService.suspendUser(record.id) : undefined)}
    />
  );
}
