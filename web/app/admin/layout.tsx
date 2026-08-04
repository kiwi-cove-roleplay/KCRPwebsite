import type { ReactNode } from "react";
import Link from "next/link";
import { requireAdminActor } from "@/lib/requireAdmin";
import { Card } from "@/components/ui/Card";

const ADMIN_NAV = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/accounts", label: "Accounts" },
  { href: "/admin/staff", label: "Staff" },
  { href: "/admin/applications", label: "Applications" },
  { href: "/admin/audit-log", label: "Audit Log" },
] as const;

// Session-level gate (fast path) - see lib/requireAdmin.ts. The
// authoritative check is portal-api's /admin/* router re-deriving
// sfos.staff.admin from the DB on every single request underneath this.
export default async function AdminLayout({ children }: { children: ReactNode }) {
  const actorAccountId = await requireAdminActor();

  if (actorAccountId === null) {
    return (
      <Card className="mx-auto max-w-md text-center text-sm text-muted">
        You don&apos;t have access to the admin dashboard.
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      <nav className="flex flex-wrap gap-4 border-b border-line pb-4 text-sm">
        {ADMIN_NAV.map((item) => (
          <Link key={item.href} href={item.href} className="font-medium text-muted transition-colors hover:text-bone">
            {item.label}
          </Link>
        ))}
      </nav>
      {children}
    </div>
  );
}
