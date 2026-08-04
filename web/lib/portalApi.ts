// Thin server-side client for the portal-api service. Never imported from a
// "use client" component - PORTAL_API_SECRET must stay server-only, and the
// browser never talks to portal-api directly (see portal-api's README for
// the trust model this mirrors).

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

  const res = await fetch(`${baseUrl}/auth/resolve`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-sfos-portal-secret": secret,
    },
    body: JSON.stringify({ discordId }),
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`portal-api /auth/resolve failed: ${res.status}`);
  }

  return (await res.json()) as PortalSession;
}
