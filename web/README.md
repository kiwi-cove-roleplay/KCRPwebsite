# sfos-web

Next.js (App Router, TypeScript) community website — landing/rules,
player portal, PD/FENZ/HHSJ recruitment, and an admin dashboard, all as one
app gated by session + permission checks. Deployed to Vercel. Talks to the
game database only indirectly, through the sibling `portal-api` service
(never holds a MySQL credential itself).

**Phase 1 status**: just Discord login wired end-to-end (NextAuth ->
`portal-api`'s `/auth/resolve` -> session). No real site content
yet — `app/page.tsx` is a placeholder that shows your resolved
account id/staff flag/permissions once signed in, to prove the chain works.
See the design doc for what's still to come.

## Local setup

1. Create a Discord application at
   https://discord.com/developers/applications, OAuth2 tab: add redirect
   URI `http://localhost:3000/api/auth/callback/discord`, copy the Client
   ID and Client Secret.
2. Have `portal-api` running locally (see its README) with a
   known `PORTAL_API_SECRET`.
3. Copy `.env.example` to `.env.local` and fill in `NEXTAUTH_SECRET`
   (any random string), the Discord client id/secret, and
   `PORTAL_API_URL`/`PORTAL_API_SECRET` matching portal-api's.
4. `pnpm install` (from repo root), then `pnpm --filter sfos-web dev` and
   open http://localhost:3000.

Signing in only resolves a real `accountId` if that Discord account has
already connected to the FiveM server at least once (same
`discord_identifier` linkage the main SFOS repo's `services/discord-bot`
relies on) — otherwise you'll see "not linked" after signing in, which is
expected, not a bug.

## Deploying to Vercel

1. Import this repo into a new Vercel project, set its **Root Directory**
   to `web`.
2. Set the same env vars as `.env.example` in the Vercel project settings
   (`NEXTAUTH_URL` = your real production domain, `PORTAL_API_URL` = your
   `portal-api`'s domain behind its reverse proxy — see that service's
   README for the Caddy setup).
3. Add a second Discord OAuth redirect URI for the production domain:
   `https://<your-domain>/api/auth/callback/discord`.
