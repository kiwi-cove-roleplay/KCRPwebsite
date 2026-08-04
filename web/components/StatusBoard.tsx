"use client";

import { useEffect, useState } from "react";

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
    return <p>Couldn&apos;t load live status.</p>;
  }

  if (!snapshot?.data) {
    return <p>No live status yet.</p>;
  }

  return (
    <div>
      <p>Last updated: {new Date(snapshot.updatedAt!).toLocaleTimeString()}</p>
      {/* Payload shape comes from sfos-core's GetOnDutyCounts() (main SFOS
          repo, not written yet) - rendered raw until that shape is known. */}
      <pre>{JSON.stringify(snapshot.data, null, 2)}</pre>
    </div>
  );
}
