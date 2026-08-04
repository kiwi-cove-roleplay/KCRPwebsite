"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { buttonClasses } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import type { AccountPermissionRow, PermissionCatalogRow } from "@/lib/adminApi";

export function PermissionsEditor({
  accountId,
  catalog,
  granted,
}: {
  accountId: number;
  catalog: PermissionCatalogRow[];
  granted: AccountPermissionRow[];
}) {
  const router = useRouter();
  const [pending, setPending] = useState<string | null>(null);
  const grantedSet = new Set(granted.map((row) => row.permission));

  async function toggle(permission: string, isGranted: boolean) {
    setPending(permission);
    try {
      if (isGranted) {
        await fetch(`/api/admin/accounts/${accountId}/permissions/${encodeURIComponent(permission)}`, {
          method: "DELETE",
        });
      } else {
        await fetch(`/api/admin/accounts/${accountId}/permissions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ permission }),
        });
      }
      router.refresh();
    } finally {
      setPending(null);
    }
  }

  return (
    <ul className="mt-3 divide-y divide-line">
      {catalog.map((entry) => {
        const isGranted = grantedSet.has(entry.permission);
        return (
          <li key={entry.permission} className="flex items-center justify-between py-2 text-sm">
            <div>
              <p className="text-bone">{entry.label}</p>
              <p className="text-xs text-muted">{entry.permission}</p>
            </div>
            <div className="flex items-center gap-3">
              {isGranted && <Badge tone="success">Granted</Badge>}
              <button
                onClick={() => toggle(entry.permission, isGranted)}
                disabled={pending === entry.permission}
                className={buttonClasses(isGranted ? "secondary" : "primary")}
              >
                {pending === entry.permission ? "Working..." : isGranted ? "Revoke" : "Grant"}
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
