import type { PortalCharacter } from "@/lib/portalApi";

// Augments next-auth's Session/User with the portal-api /auth/resolve
// result cached on the Prisma User row - see lib/auth.ts's events.signIn
// (where it's written) and session callback (where it's read back).
declare module "next-auth" {
  interface Session {
    // This website account's own Prisma User.id - distinct from accountId
    // (the FiveM/game account id, which is null until portal-api resolves
    // it). Used to attribute website-native data (e.g. Application rows)
    // to a signed-in visitor regardless of whether they have a game link.
    websiteUserId: string;
    discordId: string | null;
    accountId: number | null;
    permissions: string[];
    isStaff: boolean;
    characters: PortalCharacter[];
  }

  // The database session strategy's session() callback receives an
  // AdapterUser (next-auth/adapters), which extends this User interface -
  // augmenting it here is what makes user.discordId etc. type-check in
  // lib/auth.ts without an `any` cast.
  interface User {
    discordId?: string | null;
    gameAccountId?: number | null;
    isStaff?: boolean;
    permissions?: string[];
    characters?: unknown;
  }
}
