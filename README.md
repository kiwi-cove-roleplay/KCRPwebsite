# KCRP Website

Kiwi Cove Roleplay's public website, player portal, staff admin dashboard,
and emergency-department (PD/FENZ/HHSJ) recruitment + live status portal.

This repo ships one deployable app, [`web/`](web/) — Next.js (App Router),
deployed to Vercel. Public site, player portal, admin dashboard, all gated
by a Discord-OAuth session. Owns its own Postgres database for website
accounts (via Prisma — see `web/prisma/schema.prisma`), so signing in
works whether or not that Discord account has ever played on the FiveM
server. `web` never touches the game's MySQL database directly, or holds a
MySQL credential.

The game data `web` needs (account id, permissions, staff status,
characters, bans, applications) comes from a **portal API that FXServer
itself serves** — not a separate Node process in this repo. That's
`resources/[core]/sfos-core/server/http_router.lua`'s `/sfos/portal/*`
routes in the sibling `SFRP_Core_2026` repo, reached over HTTPS with a
shared secret via a Caddy TLS reverse proxy in front of a loopback-only
FXServer HTTP listener. `web` calls it once per sign-in as a best-effort
enrichment step — it's never required for the website login itself to
succeed — and again for anything admin-dashboard-related, always
server-side (`web/lib/portalApi.ts`, `web/lib/adminApi.ts`).

See `web/README.md` for local setup and deployment. This repo is
intentionally separate from the FiveM/game-server (`SFRP_Core_2026`) repo
— see that repo's design doc (`docs/community-web-platform.md`,
"Community Web Platform") for the full architecture, trust model, phased
build plan, and database reference.

## Getting started

```bash
pnpm install
pnpm --filter sfos-web dev
```

`web` needs its own `.env.local` — copy `web/.env.example` and fill in
real values (see `web/README.md`), including a running (or reachable)
FXServer for `PORTAL_API_URL`/`PORTAL_API_SECRET` if you want game-linked
data to resolve locally.
