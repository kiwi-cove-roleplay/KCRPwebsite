import type { NextAuthOptions } from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import { resolvePortalSession } from "./portalApi";

interface DiscordProfile {
  id: string;
}

export const authOptions: NextAuthOptions = {
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID ?? "",
      clientSecret: process.env.DISCORD_CLIENT_SECRET ?? "",
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    // account/profile are only present on the initial sign-in request, not
    // on every subsequent session read - that's the one point this calls
    // out to portal-api, rather than on every page load.
    async jwt({ token, account, profile }) {
      if (account && profile) {
        const discordId = (profile as DiscordProfile).id;
        const resolved = await resolvePortalSession(discordId);
        token.discordId = discordId;
        token.accountId = resolved.accountId;
        token.permissions = resolved.permissions;
        token.isStaff = resolved.isStaff;
        token.characters = resolved.characters;
      }
      return token;
    },
    async session({ session, token }) {
      session.accountId = token.accountId ?? null;
      session.permissions = token.permissions ?? [];
      session.isStaff = token.isStaff ?? false;
      session.characters = token.characters ?? [];
      return session;
    },
  },
};
