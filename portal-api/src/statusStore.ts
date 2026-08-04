// In-memory latest-snapshot store for the public on-duty status board
// (design doc section 5). No persistence needed - this is a cheap,
// infrequent, fire-and-forget push from sfos-core (~every 60s), and losing
// the last snapshot on a portal-api restart just means a brief "no live
// status yet" until the next push, not a real problem.
export interface StatusSnapshot {
  data: unknown;
  updatedAt: string;
}

let snapshot: StatusSnapshot | null = null;

export function setStatusSnapshot(data: unknown): void {
  snapshot = { data, updatedAt: new Date().toISOString() };
}

export function getStatusSnapshot(): StatusSnapshot | null {
  return snapshot;
}
