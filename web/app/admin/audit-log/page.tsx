import { requireAdminActor } from "@/lib/requireAdmin";
import { listStaffActions, type StaffActionRow } from "@/lib/adminApi";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { PortalApiUnavailable } from "@/components/admin/PortalApiUnavailable";

export default async function AdminAuditLogPage() {
  const actorAccountId = await requireAdminActor();
  if (actorAccountId === null) {
    return null;
  }

  let actions: StaffActionRow[] | null = null;
  try {
    actions = await listStaffActions(actorAccountId);
  } catch (error) {
    console.error("Failed to load staff action audit log", error);
  }

  if (!actions) {
    return (
      <div className="space-y-8">
        <PageHeader title="Staff Action Audit Log" />
        <PortalApiUnavailable />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader title="Staff Action Audit Log" />
      <Card className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="text-muted">
            <tr>
              <th className="pb-2 pr-4">When</th>
              <th className="pb-2 pr-4">Actor</th>
              <th className="pb-2 pr-4">Action</th>
              <th className="pb-2 pr-4">Target</th>
              <th className="pb-2">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {actions.map((action) => (
              <tr key={action.id}>
                <td className="py-2 pr-4 text-muted">{new Date(action.created_at).toLocaleString()}</td>
                <td className="py-2 pr-4 text-bone">{action.actor_name ?? "unknown"}</td>
                <td className="py-2 pr-4 text-bone">{action.action}</td>
                <td className="py-2 pr-4 text-muted">
                  {action.target_type ? `${action.target_type} ${action.target_id ?? ""}` : "—"}
                </td>
                <td className="py-2 text-muted">{action.details ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
