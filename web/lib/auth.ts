import type { NextAuthOptions } from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import type { Prisma } from "@prisma/client";
import { prisma } from "./prisma";
import { resolvePortalSession, type PortalSession } from "./portalApi";
import { STAFF_ADMIN_PERMISSION } from "./permissions";

interface DiscordProfile {
  id: string;
  username: string;
  email: string | null;
  avatar: string | null;
  discriminator: string;
  image_url?: string;
}

// portal-api (and the FiveM/SFOS MySQL database behind it) is best-effort
// enrichment, not a login dependency - a website account (Prisma's User
// row, created by the adapter below) exists purely from a successful
// Discord sign-in. If portal-api is unreachable, misconfigured, or the
// Discord account has never connected to the FiveM server, this just
// returns the "not linked" shape instead of throwing, so signing in to the
// website never fails because of it.
async function resolvePortalSessionSafely(discordId: string): Promise<PortalSession> {
  try {
    return await resolvePortalSession(discordId);
  } catch (error) {
    console.error("portal-api /auth/resolve unavailable - continuing as not linked", error);
    return { accountId: null, permissions: [], isStaff: false, characters: [] };
  }
}

// Temporary escape hatch for standing up the very first admin while
// portal-api is down/not deployed yet - there's otherwise no bootstrap path
// (see portal-api's README), since /admin/* always re-derives
// sfos.staff.admin from the game database on every request, and won't trust
// anything the website claims about permissions.
//
// This does NOT grant real admin authority by itself: it only lets the
// listed Discord id past this site's own /admin gate (lib/requireAdmin.ts)
// using the FiveM account id you provide - portal-api's admin endpoints
// still independently re-check that exact account id against
// permission_grants before doing anything, so this only "works" for an
// account that's genuinely already staff there. Unset ADMIN_BYPASS_ACCOUNTS
// once portal-api is reachable again; there's no reason to leave a
// hardcoded allowlist in production longer than necessary.
//
// Format: "discordId:accountId,discordId2:accountId2"
interface AdminBypassEntry {
  discordId: string;
  accountId: number;
}

function loadAdminBypass(): AdminBypassEntry[] {
  const raw = process.env.ADMIN_BYPASS_ACCOUNTS;
  if (!raw) {
    return [];
  }
  return raw
    .split(",")
    .map((pair) => {
      const [discordId, accountIdRaw] = pair.split(":").map((part) => part.trim());
      return { discordId, accountId: Number(accountIdRaw) };
    })
    .filter((entry): entry is AdminBypassEntry => Boolean(entry.discordId) && Number.isInteger(entry.accountId));
}

export const authOptions: NextAuthOptions = {
  // Postgres-backed website accounts DB, separate from the FiveM/SFOS MySQL
  // database - see prisma/schema.prisma's top comment and the root
  // README's architecture section.
  adapter: PrismaAdapter(prisma),
  session: { strategy: "database" },
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID ?? "",
      clientSecret: process.env.DISCORD_CLIENT_SECRET ?? "",
      // Overrides the default profile() mapping purely to also carry
      // discordId through to the adapter's createUser call, so it lands on
      // our User model's discordId column at account creation - the
      // avatar/name/email mapping below is otherwise identical to
      // next-auth's built-in Discord provider.
      profile(profile: DiscordProfile) {
        const avatarNumber = Number(profile.discriminator) % 5;
        const imageUrl = profile.avatar
          ? `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.${profile.avatar.startsWith("a_") ? "gif" : "png"}`
          : `https://cdn.discordapp.com/embed/avatars/${avatarNumber}.png`;
        return {
          id: profile.id,
          name: profile.username,
          email: profile.email,
          image: imageUrl,
          discordId: profile.id,
        };
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  events: {
    // Fires once per actual sign-in (not on every session read) - the same
    // cadence the old JWT-based `if (account && profile)` gate used, just
    // persisted to the User row instead of the token so it doesn't need
    // re-resolving on every page load. See resolvePortalSessionSafely above
    // for why this never blocks the sign-in itself.
    async signIn({ user, account }) {
      if (account?.provider !== "discord") {
        return;
      }
      const discordId = account.providerAccountId;
      const resolved = await resolvePortalSessionSafely(discordId);
      const bypass = loadAdminBypass().find((entry) => entry.discordId === discordId);

      const gameAccountId = resolved.accountId ?? bypass?.accountId ?? null;
      const isStaff = resolved.isStaff || Boolean(bypass);
      const permissions =
        bypass && !resolved.permissions.includes(STAFF_ADMIN_PERMISSION)
          ? [...resolved.permissions, STAFF_ADMIN_PERMISSION]
          : resolved.permissions;

      await prisma.user
        .update({
          where: { id: user.id },
          data: {
            discordId,
            gameAccountId,
            isStaff,
            permissions,
            characters: resolved.characters as unknown as Prisma.InputJsonValue,
          },
        })
        .catch((error) => {
          console.error("Failed to cache portal-api resolution on user", error);
        });
    },
  },
  callbacks: {
    async session({ session, user }) {
      session.discordId = user.discordId ?? null;
      session.accountId = user.gameAccountId ?? null;
      session.permissions = user.permissions ?? [];
      session.isStaff = user.isStaff ?? false;
      session.characters = (user.characters as PortalSession["characters"]) ?? [];
      return session;
    },
  },
};
