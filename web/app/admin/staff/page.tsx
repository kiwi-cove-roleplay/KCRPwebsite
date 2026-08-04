import { requireAdminActor } from "@/lib/requireAdmin";
import { listStaff } from "@/lib/adminApi";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { AppointStaffForm } from "@/components/admin/AppointStaffForm";
import { StaffRosterTable } from "@/components/admin/StaffRosterTable";

export default async function AdminStaffPage() {
  const actorAccountId = await requireAdminActor();
  if (actorAccountId === null) {
    return null;
  }

  const staff = await listStaff(actorAccountId);

  return (
    <div className="space-y-8">
      <PageHeader title="Staff Roster" />
      <Card>
        <h2 className="text-lg text-bone">Appoint Staff</h2>
        <AppointStaffForm />
      </Card>
      <Card>
        <h2 className="text-lg text-bone">Current Staff</h2>
        <StaffRosterTable staff={staff} />
      </Card>
    </div>
  );
}
