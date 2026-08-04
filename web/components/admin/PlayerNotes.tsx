"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { buttonClasses } from "@/components/ui/Button";
import type { PlayerNoteRow } from "@/lib/adminApi";

const INPUT_CLASSES =
  "flex-1 rounded-md border border-line bg-ink px-3 py-2 text-sm text-bone placeholder:text-muted "
  + "focus:border-moss-500 focus:outline-none focus:ring-1 focus:ring-moss-500";

export function PlayerNotes({ accountId, notes }: { accountId: number; notes: PlayerNoteRow[] }) {
  const router = useRouter();
  const [note, setNote] = useState("");
  const [pending, setPending] = useState(false);

  async function handleAdd() {
    if (note.trim().length === 0) {
      return;
    }
    setPending(true);
    try {
      await fetch(`/api/admin/accounts/${accountId}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note }),
      });
      setNote("");
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mt-3 space-y-4">
      <div className="flex gap-2">
        <input value={note} onChange={(event) => setNote(event.target.value)} placeholder="Add a note" className={INPUT_CLASSES} />
        <button onClick={handleAdd} disabled={pending} className={buttonClasses("primary")}>
          {pending ? "Working..." : "Add"}
        </button>
      </div>
      {notes.length === 0 ? (
        <p className="text-sm text-muted">No notes yet.</p>
      ) : (
        <ul className="divide-y divide-line">
          {notes.map((entry) => (
            <li key={entry.id} className="py-2 text-sm">
              <p className="text-bone">{entry.note}</p>
              <p className="text-xs text-muted">
                {entry.author_name ?? "unknown"} — {new Date(entry.created_at).toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
