"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";

interface StatusSnapshot {
  data: unknown;
  updatedAt: string | null;
}

const POLL_INTERVAL_MS = 45_000;

export function StatusBoard() {
  const [snapshot, setSnapshot] = useState<StatusSnapshot | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      try {
        const res = await fetch("/api/status", { cache: "no-store" });
        const json = (await res.json()) as StatusSnapshot;
        if (!cancelled) {
          setSnapshot(json);
          setError(false);
        }
      } catch {
        if (!cancelled) {
          setError(true);
        }
      }
    }

    poll();
    const interval = setInterval(poll, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  if (error) {
    return <Card className="text-sm text-red-400">Couldn&apos;t load live status.</Card>;
  }

  if (!snapshot?.data) {
    return <Card className="text-sm text-muted">No live status yet.</Card>;
  }

  return (
    <Card>
      <div className="flex items-center gap-2 text-sm text-moss-400">
        <span className="h-2 w-2 animate-pulse rounded-full bg-moss-400" />
        Last updated: {new Date(snapshot.updatedAt!).toLocaleTimeString()}
      </div>
      {/* Payload shape comes from sfos-core's GetOnDutyCounts() (main SFOS
          repo, not written yet) - rendered raw until that shape is known. */}
      <pre className="mt-4 overflow-x-auto rounded-md bg-ink p-4 text-sm text-bone">
        {JSON.stringify(snapshot.data, null, 2)}
      </pre>
    </Card>
  );
}
