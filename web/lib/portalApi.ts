// Thin server-side client for the community web platform's portal API,
// which FXServer itself serves (resources/[core]/sfos-core/server/
// http_router.lua's /sfos/portal/* routes in the SFRP_Core_2026 repo, see
// docs/community-web-platform.md there) - there's no separate Node
// service anymore. Never imported from a "use client" component -
// PORTAL_API_SECRET must stay server-only, and the browser never talks to
// this API directly (see that doc's trust model, section 3).

export interface PortalCharacter {
  character_id: number;
  first_name: string;
  last_name: string;
  agency_code: string | null;
  duty_status: "on_duty" | "off_duty";
}

export interface PortalSession {
  accountId: number | null;
  permissions: string[];
  isStaff: boolean;
  characters: PortalCharacter[];
}

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

export async function resolvePortalSession(discordId: string): Promise<PortalSession> {
  const baseUrl = requiredEnv("PORTAL_API_URL");
  const secret = requiredEnv("PORTAL_API_SECRET");

  const res = await fetch(`${baseUrl}/sfos/portal/auth/resolve`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-sfos-portal-secret": secret,
    },
    body: JSON.stringify({ discordId }),
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`portal API /sfos/portal/auth/resolve failed: ${res.status}`);
  }

  return (await res.json()) as PortalSession;
}

export type DepartmentCode = "NZP" | "FENZ" | "HHSJ";

export interface DepartmentApplicationInput {
  discordId: string;
  discordUsername: string;
  department: DepartmentCode;
  answers: Record<string, string>;
}

export async function submitDepartmentApplication(input: DepartmentApplicationInput): Promise<void> {
  const baseUrl = requiredEnv("PORTAL_API_URL");
  const secret = requiredEnv("PORTAL_API_SECRET");

  const res = await fetch(`${baseUrl}/sfos/portal/applications`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-sfos-portal-secret": secret,
    },
    body: JSON.stringify(input),
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`portal API /sfos/portal/applications failed: ${res.status}`);
  }
}

export type ApplicationStatus = "pending" | "accepted" | "rejected";

export interface ApplicationSummary {
  id: number;
  department: DepartmentCode;
  status: ApplicationStatus;
  created_at: string;
  reviewed_at: string | null;
}

export interface PortalSummary {
  characters: PortalCharacter[];
  applications: ApplicationSummary[];
}

// Fetched fresh on every /portal page load (not read off the session
// token) so a new character or a reviewed application shows up without
// forcing a re-login - see the router's POST /sfos/portal/summary handler.
export async function fetchPortalSummary(accountId: number, discordId: string): Promise<PortalSummary> {
  const baseUrl = requiredEnv("PORTAL_API_URL");
  const secret = requiredEnv("PORTAL_API_SECRET");

  const res = await fetch(`${baseUrl}/sfos/portal/summary`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-sfos-portal-secret": secret,
    },
    body: JSON.stringify({ accountId, discordId }),
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`portal API /sfos/portal/summary failed: ${res.status}`);
  }

  return (await res.json()) as PortalSummary;
}

export interface StatusSnapshot {
  data: unknown;
  updatedAt: string | null;
}

// GET /sfos/portal/status is the one deliberately public route (computed
// live from GetOnDutyCounts() on the FXServer side, no push/cache), but web
// still proxies it (rather than having the browser hit FXServer directly)
// so there's exactly one "browser never talks to the portal API directly"
// rule, no exceptions - see the SFRP_Core_2026 repo's docs/
// community-web-platform.md, section 3's trust model.
export async function fetchStatus(): Promise<StatusSnapshot> {
  const baseUrl = requiredEnv("PORTAL_API_URL");

  const res = await fetch(`${baseUrl}/sfos/portal/status`, { cache: "no-store" });

  if (!res.ok) {
    throw new Error(`portal API /sfos/portal/status failed: ${res.status}`);
  }

  return (await res.json()) as StatusSnapshot;
}
