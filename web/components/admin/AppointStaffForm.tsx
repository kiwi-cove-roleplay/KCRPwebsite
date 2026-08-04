"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { buttonClasses } from "@/components/ui/Button";

const INPUT_CLASSES =
  "rounded-md border border-line bg-ink px-3 py-2 text-sm text-bone placeholder:text-muted "
  + "focus:border-moss-500 focus:outline-none focus:ring-1 focus:ring-moss-500";

export function AppointStaffForm() {
  const router = useRouter();
  const [accountId, setAccountId] = useState("");
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsedId = Number(accountId);
    if (!Number.isInteger(parsedId) || title.trim().length === 0) {
      return;
    }
    setPending(true);
    try {
      await fetch("/api/admin/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountId: parsedId, title, notes: notes || null }),
      });
      setAccountId("");
      setTitle("");
      setNotes("");
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3 grid gap-3 sm:grid-cols-4">
      <input
        value={accountId}
        onChange={(event) => setAccountId(event.target.value)}
        placeholder="Account ID"
        className={INPUT_CLASSES}
      />
      <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Title" className={INPUT_CLASSES} />
      <input
        value={notes}
        onChange={(event) => setNotes(event.target.value)}
        placeholder="Notes (optional)"
        className={INPUT_CLASSES}
      />
      <button type="submit" disabled={pending} className={buttonClasses("primary")}>
        {pending ? "Working..." : "Appoint"}
      </button>
    </form>
  );
}
