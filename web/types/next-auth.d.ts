import type { PortalCharacter } from "@/lib/portalApi";

// Augments next-auth's Session/JWT with the portal-api /auth/resolve
// result, attached in lib/auth.ts's jwt/session callbacks.
declare module "next-auth" {
  interface Session {
    discordId: string | null;
    accountId: number | null;
    permissions: string[];
    isStaff: boolean;
    characters: PortalCharacter[];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    discordId?: string;
    accountId?: number | null;
    permissions?: string[];
    isStaff?: boolean;
    characters?: PortalCharacter[];
  }
}
