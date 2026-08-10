import Link from "next/link";
import { requireAdminActor } from "@/lib/requireAdmin";
import { listBans, listStaff } from "@/lib/adminApi";
import { listApplicationsForAdmin } from "@/lib/applications";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { PortalApiUnavailable } from "@/components/PortalApiUnavailable";

export default async function AdminOverviewPage() {
  const actorAccountId = await requireAdminActor();
  if (actorAccountId === null) {
    // Unreachable in practice - app/admin/layout.tsx already gates this
    // whole route segment before this page's body ever runs.
    return null;
  }

  // Pending applications live in this website's own database (see
  // lib/applications.ts) so this always resolves; bans/staff are
  // inherently game-linked concepts that only exist via portal-api, so
  // those degrade independently if it's unreachable.
  const pending = await listApplicationsForAdmin("pending");

  let gameStats: { label: string; value: number; href: string }[] | null = null;
  try {
    const [bans, staff] = await Promise.all([listBans(actorAccountId), listStaff(actorAccountId)]);
    gameStats = [
      { label: "Active bans", value: bans.length, href: "/admin/accounts" },
      { label: "Staff members", value: staff.length, href: "/admin/staff" },
    ];
  } catch (error) {
    console.error("Failed to load game-linked admin overview stats", error);
  }

  return (
    <div className="space-y-8">
      <PageHeader title="Admin Dashboard" />
      <div className="grid gap-4 sm:grid-cols-3">
        <Link href="/admin/applications">
          <Card className="text-center transition-colors hover:border-moss-600/60">
            <p className="text-3xl text-bone">{pending.length}</p>
            <p className="mt-1 text-sm text-muted">Pending applications</p>
          </Card>
        </Link>
        {gameStats?.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <Card className="text-center transition-colors hover:border-moss-600/60">
              <p className="text-3xl text-bone">{stat.value}</p>
              <p className="mt-1 text-sm text-muted">{stat.label}</p>
            </Card>
          </Link>
        ))}
      </div>
      {!gameStats && (
        <PortalApiUnavailable
          title="Bans and staff counts aren't available"
          message="Those come from the game server via portal-api. Applications above work independently of it."
        />
      )}
    </div>
  );
}
