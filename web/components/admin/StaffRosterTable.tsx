"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { buttonClasses } from "@/components/ui/Button";
import type { StaffRosterRow } from "@/lib/adminApi";

export function StaffRosterTable({ staff }: { staff: StaffRosterRow[] }) {
  const router = useRouter();
  const [pending, setPending] = useState<number | null>(null);

  async function handleRemove(accountId: number) {
    setPending(accountId);
    try {
      await fetch(`/api/admin/staff/${accountId}`, { method: "DELETE" });
      router.refresh();
    } finally {
      setPending(null);
    }
  }

  if (staff.length === 0) {
    return <p className="mt-2 text-sm text-muted">No staff appointed yet.</p>;
  }

  return (
    <ul className="mt-3 divide-y divide-line">
      {staff.map((member) => (
        <li key={member.account_id} className="flex items-center justify-between py-2 text-sm">
          <div>
            <Link href={`/admin/accounts/${member.account_id}`} className="text-bone hover:underline">
              {member.fivem_username}
            </Link>{" "}
            <span className="text-muted">— {member.title}</span>
            {member.notes && <p className="text-xs text-muted">{member.notes}</p>}
          </div>
          <button
            onClick={() => handleRemove(member.account_id)}
            disabled={pending === member.account_id}
            className={buttonClasses("secondary")}
          >
            {pending === member.account_id ? "Working..." : "Remove"}
          </button>
        </li>
      ))}
    </ul>
  );
}
