"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { buttonClasses } from "@/components/ui/Button";

const INPUT_CLASSES =
  "flex-1 rounded-md border border-line bg-ink px-3 py-2 text-sm text-bone placeholder:text-muted "
  + "focus:border-moss-500 focus:outline-none focus:ring-1 focus:ring-moss-500";

export function BanControls({ accountId, isBanned }: { accountId: number; isBanned: boolean }) {
  const router = useRouter();
  const [reason, setReason] = useState("");
  const [pending, setPending] = useState(false);

  async function handleBan() {
    if (reason.trim().length === 0) {
      return;
    }
    setPending(true);
    try {
      await fetch("/api/admin/bans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountId, reason, expiresAt: null }),
      });
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  async function handleUnban() {
    setPending(true);
    try {
      await fetch(`/api/admin/bans/${accountId}/unban`, { method: "POST" });
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  if (isBanned) {
    return (
      <button onClick={handleUnban} disabled={pending} className={buttonClasses("secondary", "mt-3")}>
        {pending ? "Working..." : "Unban"}
      </button>
    );
  }

  return (
    <div className="mt-3 flex gap-2">
      <input
        value={reason}
        onChange={(event) => setReason(event.target.value)}
        placeholder="Ban reason"
        className={INPUT_CLASSES}
      />
      <button onClick={handleBan} disabled={pending} className={buttonClasses("primary")}>
        {pending ? "Working..." : "Ban"}
      </button>
    </div>
  );
}
