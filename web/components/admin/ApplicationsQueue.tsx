"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { buttonClasses } from "@/components/ui/Button";
import type { ApplicationReviewRow } from "@/lib/adminApi";

export function ApplicationsQueue({
  applications,
  showActions,
}: {
  applications: ApplicationReviewRow[];
  showActions: boolean;
}) {
  const router = useRouter();
  const [pending, setPending] = useState<number | null>(null);

  async function handleReview(id: number, status: "accepted" | "rejected") {
    setPending(id);
    try {
      await fetch(`/api/admin/applications/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      router.refresh();
    } finally {
      setPending(null);
    }
  }

  if (applications.length === 0) {
    return <Card className="text-sm text-muted">No applications here.</Card>;
  }

  return (
    <div className="space-y-4">
      {applications.map((application) => (
        <Card key={application.id}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-bone">
                {application.department} — {application.discord_username}
              </p>
              <p className="text-xs text-muted">Submitted {new Date(application.created_at).toLocaleString()}</p>
            </div>
            {showActions && (
              <div className="flex gap-2">
                <button
                  onClick={() => handleReview(application.id, "accepted")}
                  disabled={pending === application.id}
                  className={buttonClasses("primary")}
                >
                  Accept
                </button>
                <button
                  onClick={() => handleReview(application.id, "rejected")}
                  disabled={pending === application.id}
                  className={buttonClasses("secondary")}
                >
                  Reject
                </button>
              </div>
            )}
          </div>
          <dl className="mt-3 space-y-2 text-sm">
            {Object.entries(application.answers).map(([question, answer]) => (
              <div key={question}>
                <dt className="text-xs uppercase text-muted">{question}</dt>
                <dd className="text-bone">{answer}</dd>
              </div>
            ))}
          </dl>
        </Card>
      ))}
    </div>
  );
}
