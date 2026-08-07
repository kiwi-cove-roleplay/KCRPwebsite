import Link from "next/link";
import { requireAdminActor } from "@/lib/requireAdmin";
import { listApplications, listBans, listStaff } from "@/lib/adminApi";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { PortalApiUnavailable } from "@/components/admin/PortalApiUnavailable";

export default async function AdminOverviewPage() {
  const actorAccountId = await requireAdminActor();
  if (actorAccountId === null) {
    // Unreachable in practice - app/admin/layout.tsx already gates this
    // whole route segment before this page's body ever runs.
    return null;
  }

  let stats: { label: string; value: number; href: string }[] | null = null;
  try {
    const [pending, bans, staff] = await Promise.all([
      listApplications(actorAccountId, "pending"),
      listBans(actorAccountId),
      listStaff(actorAccountId),
    ]);
    stats = [
      { label: "Pending applications", value: pending.length, href: "/admin/applications" },
      { label: "Active bans", value: bans.length, href: "/admin/accounts" },
      { label: "Staff members", value: staff.length, href: "/admin/staff" },
    ];
  } catch (error) {
    console.error("Failed to load admin overview stats", error);
  }

  return (
    <div className="space-y-8">
      <PageHeader title="Admin Dashboard" />
      {stats ? (
        <div className="grid gap-4 sm:grid-cols-3">
          {stats.map((stat) => (
            <Link key={stat.label} href={stat.href}>
              <Card className="text-center transition-colors hover:border-moss-600/60">
                <p className="text-3xl text-bone">{stat.value}</p>
                <p className="mt-1 text-sm text-muted">{stat.label}</p>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <PortalApiUnavailable />
      )}
    </div>
  );
}
