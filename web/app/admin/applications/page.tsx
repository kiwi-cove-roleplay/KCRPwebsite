import Link from "next/link";
import { requireAdminActor } from "@/lib/requireAdmin";
import { listApplicationsForAdmin } from "@/lib/applications";
import { PageHeader } from "@/components/ui/PageHeader";
import { ApplicationsQueue } from "@/components/admin/ApplicationsQueue";
import type { ApplicationStatus } from "@/lib/portalApi";

const TABS: { status: ApplicationStatus; label: string }[] = [
  { status: "pending", label: "Pending" },
  { status: "accepted", label: "Accepted" },
  { status: "rejected", label: "Rejected" },
];

export default async function AdminApplicationsPage({ searchParams }: { searchParams: { status?: string } }) {
  const actorAccountId = await requireAdminActor();
  if (actorAccountId === null) {
    return null;
  }

  const status = (searchParams.status as ApplicationStatus | undefined) ?? "pending";
  const applications = await listApplicationsForAdmin(status);

  return (
    <div className="space-y-8">
      <PageHeader title="Recruitment Applications" />
      <div className="flex gap-4 text-sm">
        {TABS.map((tab) => (
          <Link
            key={tab.status}
            href={`/admin/applications?status=${tab.status}`}
            className={tab.status === status ? "font-semibold text-moss-400" : "text-muted hover:text-bone"}
          >
            {tab.label}
          </Link>
        ))}
      </div>
      <ApplicationsQueue applications={applications} showActions={status === "pending"} />
    </div>
  );
}
