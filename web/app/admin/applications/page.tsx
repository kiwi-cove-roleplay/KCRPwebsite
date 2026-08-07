import Link from "next/link";
import { requireAdminActor } from "@/lib/requireAdmin";
import { listApplications, type ApplicationReviewRow } from "@/lib/adminApi";
import { PageHeader } from "@/components/ui/PageHeader";
import { ApplicationsQueue } from "@/components/admin/ApplicationsQueue";
import { PortalApiUnavailable } from "@/components/admin/PortalApiUnavailable";
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
  let applications: ApplicationReviewRow[] | null = null;
  try {
    applications = await listApplications(actorAccountId, status);
  } catch (error) {
    console.error("Failed to load applications", error);
  }

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
      {applications ? (
        <ApplicationsQueue applications={applications} showActions={status === "pending"} />
      ) : (
        <PortalApiUnavailable />
      )}
    </div>
  );
}
