# sfos-web

Next.js (App Router, TypeScript) community website — landing/rules,
player portal, PD/FENZ/HHSJ recruitment, and an admin dashboard, all as one
app gated by session + permission checks. Deployed to Vercel. Talks to the
game database only indirectly, through the sibling `portal-api` service
(never holds a MySQL credential itself).

## Accounts and login

Signing in with Discord always creates a real website account, in this
app's own Postgres database (`prisma/schema.prisma`, via
`@next-auth/prisma-adapter`) — whether or not that Discord account has ever
connected to the FiveM server. That's deliberate: the website's login
doesn't depend on portal-api or the game server's MySQL being reachable.

Once signed in, `lib/auth.ts`'s `events.signIn` makes one best-effort call
to portal-api's `POST /auth/resolve` to look up the player's FiveM
`accountId`, permissions, staff status, and characters, and caches the
result on that user's row. If portal-api is down, misconfigured, or the
Discord account just hasn't connected to the server yet, this fails
gracefully — you get a normal, working website account with those fields
left at "not linked" (`accountId: null` in the session) until a later
sign-in resolves successfully. Nothing about the portal-api round trip can
block or break signing in to the website itself.

**Phase 3 status**: public pages (landing, rules, how-to-join, department
overview/detail), a live on-duty status board (`/status`, polling this
app's own `/api/status`, which proxies portal-api's public `GET /status`),
a recruitment application form per department (`/departments/[slug]/
apply`, posting to `/api/applications`, which requires a signed-in,
linked-account session and calls portal-api's `POST /applications`), and a
player portal (`/portal`, linked from nav only while signed in) showing
the signed-in player's account, characters, and their own application
statuses — fetched fresh from portal-api's `POST /portal/summary` on every
page load, not read off the session token, so a new character or a
reviewed application shows up without a re-login. Department pages only
link to `/apply` when that department's `recruitmentOpen` flag
(`lib/departments.ts`) is `true` — flip it per department once you're
ready to accept applications; the apply route itself works regardless,
for testing. The Phase 1 debug readout (resolved account id/staff
flag/permissions) moved to `/debug`, not linked from nav. The admin
dashboard is Phase 4 — see the design doc.

## Local setup

1. Get a local Postgres running (e.g. `postgres.app`, Docker, or your
   package manager) and create a database for this app, e.g. `kcrp_web`.
2. Create a Discord application at
   https://discord.com/developers/applications, OAuth2 tab: add redirect
   URI `http://localhost:3000/api/auth/callback/discord`, copy the Client
   ID and Client Secret.
3. (Optional but recommended) Have `portal-api` running locally (see its
   README) with a known `PORTAL_API_SECRET` — the site works without it,
   but game-linked data (characters, staff status) won't resolve.
4. Copy `.env.example` to `.env.local` and fill in `DATABASE_URL`,
   `NEXTAUTH_SECRET` (any random string), the Discord client id/secret, and
   `PORTAL_API_URL`/`PORTAL_API_SECRET` matching portal-api's.
5. `pnpm install` (from repo root) — this also runs `prisma generate`.
   Then create the website-accounts tables:
   `pnpm --filter sfos-web exec prisma migrate deploy`.
6. `pnpm --filter sfos-web dev` and open http://localhost:3000.

Signing in only resolves a real `accountId` if that Discord account has
already connected to the FiveM server at least once (same
`discord_identifier` linkage the main SFOS repo's `services/discord-bot`
relies on) — otherwise you'll see "not linked" after signing in, which is
expected, not a bug.

## Deploying to Vercel

1. Provision a Postgres database (Vercel Postgres, Neon, or Supabase all
   work — pick whichever, this is a plain Postgres connection string, no
   provider-specific features used).
2. Import this repo into a new Vercel project, set its **Root Directory**
   to `web`.
3. Set the same env vars as `.env.example` in the Vercel project settings
   (`DATABASE_URL` = your Postgres connection string, `NEXTAUTH_URL` = your
   real production domain, `PORTAL_API_URL` = your `portal-api`'s domain
   behind its reverse proxy — see that service's README for the Caddy
   setup).
4. Run `prisma migrate deploy` against that `DATABASE_URL` once (locally,
   with it set in your shell, or via a one-off Vercel build command) to
   create the website-accounts tables before the first deploy.
5. Add a second Discord OAuth redirect URI for the production domain:
   `https://<your-domain>/api/auth/callback/discord`.
