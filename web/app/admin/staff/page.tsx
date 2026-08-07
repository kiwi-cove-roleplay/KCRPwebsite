import { requireAdminActor } from "@/lib/requireAdmin";
import { listStaff, type StaffRosterRow } from "@/lib/adminApi";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { AppointStaffForm } from "@/components/admin/AppointStaffForm";
import { StaffRosterTable } from "@/components/admin/StaffRosterTable";
import { PortalApiUnavailable } from "@/components/admin/PortalApiUnavailable";

export default async function AdminStaffPage() {
  const actorAccountId = await requireAdminActor();
  if (actorAccountId === null) {
    return null;
  }

  let staff: StaffRosterRow[] | null = null;
  try {
    staff = await listStaff(actorAccountId);
  } catch (error) {
    console.error("Failed to load staff roster", error);
  }

  return (
    <div className="space-y-8">
      <PageHeader title="Staff Roster" />
      <Card>
        <h2 className="text-lg text-bone">Appoint Staff</h2>
        <AppointStaffForm />
      </Card>
      {staff ? (
        <Card>
          <h2 className="text-lg text-bone">Current Staff</h2>
          <StaffRosterTable staff={staff} />
        </Card>
      ) : (
        <PortalApiUnavailable />
      )}
    </div>
  );
}
