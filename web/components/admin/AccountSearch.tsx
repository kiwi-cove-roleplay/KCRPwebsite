"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { buttonClasses } from "@/components/ui/Button";
import type { AccountSearchResult } from "@/lib/adminApi";

const INPUT_CLASSES =
  "flex-1 rounded-md border border-line bg-ink px-3 py-2 text-sm text-bone placeholder:text-muted "
  + "focus:border-moss-500 focus:outline-none focus:ring-1 focus:ring-moss-500";

export function AccountSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<AccountSearchResult[] | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (query.trim().length === 0) {
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/accounts/search?q=${encodeURIComponent(query)}`);
      setResults(res.ok ? await res.json() : []);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by username or account ID"
          className={INPUT_CLASSES}
        />
        <button type="submit" disabled={loading} className={buttonClasses("primary")}>
          {loading ? "Searching..." : "Search"}
        </button>
      </form>
      {results && (
        <ul className="divide-y divide-line rounded-lg border border-line">
          {results.length === 0 && <li className="p-4 text-sm text-muted">No accounts found.</li>}
          {results.map((account) => (
            <li key={account.account_id} className="flex items-center justify-between p-4 text-sm">
              <Link href={`/admin/accounts/${account.account_id}`} className="text-bone hover:underline">
                {account.fivem_username} <span className="text-muted">#{account.account_id}</span>
              </Link>
              {account.is_banned && <Badge tone="danger">Banned</Badge>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
