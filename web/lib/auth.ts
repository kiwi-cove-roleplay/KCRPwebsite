import type { NextAuthOptions } from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import type { Prisma } from "@prisma/client";
import { prisma } from "./prisma";
import { resolvePortalSession, type PortalSession } from "./portalApi";

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
      await prisma.user
        .update({
          where: { id: user.id },
          data: {
            discordId,
            gameAccountId: resolved.accountId,
            isStaff: resolved.isStaff,
            permissions: resolved.permissions,
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
