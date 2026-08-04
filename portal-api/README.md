# sfos-portal-api

Standalone Node.js process (not a FiveM resource, unlike the main SFOS
repo's `services/discord-bot`). Small read-only HTTP API in front of the
same MySQL database `sfos-core` reads via `oxmysql` — it exists so the
sibling `web` app (the community site, deployed on Vercel) never needs a
MySQL credential or direct network access to the game database. `web`'s
server-side code is the only intended caller.

Routes:

- `POST /auth/resolve` — used by `web`'s NextAuth sign-in flow to look up
  an account by Discord id.
- `POST /applications` — writes a recruitment application row to
  `department_applications`. Called by `web`'s own `/api/applications`
  route after it verifies the caller has a session; not built to be called
  with an unauthenticated Discord id.
- `GET /status` — **public, no shared secret** — returns the latest
  on-duty snapshot for the live status board. The only route exempt from
  the auth model below.
- `POST /status/report` — upserts that snapshot (shared-secret protected,
  same as everything but `/status`). Intended caller is a small Lua push
  in the main SFOS repo's `sfos-core` (not written yet — see the design
  doc section 5); until that's wired up, `GET /status` just returns
  `{ data: null, updatedAt: null }`.
- `POST /portal/summary` — returns a signed-in player's characters and
  their own `department_applications` rows, for `web`'s `/portal` page.
  Takes `{ accountId, discordId }` from the caller's own session, not
  arbitrary/attacker-controlled input, so — unlike Phase 4's admin
  actions — this is only ever a read of the caller's own data, not an
  authorization decision.

Admin dashboard actions land in Phase 4 — see the design doc for the
overall plan.

`POST /applications` depends on a `department_applications` table that
this service never creates — it's owned by the main SFOS repo's
`database/migrations/` (see `0034_department_applications.sql` there).
Run that migration (or the regenerated `all_migrations.sql`) against the
database before this endpoint will work.

## Setup

1. Copy `.env.example` to `.env` and fill in your DB credentials (same
   database the main SFOS repo's `sfos-core`/`services/discord-bot` use)
   and a `PORTAL_API_SECRET` — generate a random string, and set the exact
   same value as `PORTAL_API_SECRET` in `web`'s `.env`/Vercel project
   settings.
2. `pnpm install` (from repo root), then `pnpm --filter sfos-portal-api dev`
   for local iteration, or `pnpm --filter sfos-portal-api build && pnpm
   --filter sfos-portal-api start` to run compiled.

## Running on a Linux VPS (production)

Same pattern as the main SFOS repo's `services/discord-bot`: run as a
systemd service so it survives crashes and reboots.

```bash
pnpm install
pnpm --filter sfos-portal-api build
sudo bash portal-api/deploy/install.sh
```

```bash
systemctl status sfos-portal-api     # is it running
journalctl -u sfos-portal-api -f     # live logs
```

To deploy an update later:

```bash
git pull
pnpm install
pnpm --filter sfos-portal-api build
sudo systemctl restart sfos-portal-api
```

### Reverse proxy (required)

Unlike the main SFOS repo's `services/discord-bot` `/log` endpoint (only
ever hit by FXServer on `localhost`, so plain HTTP is fine), this API is
hit by `web` running on Vercel — over the public internet. Put a reverse
proxy with real TLS in front of it on a subdomain you control (e.g.
`api.yourdomain.tld`). [Caddy](https://caddyserver.com/) is the simplest
option — it provisions a Let's Encrypt certificate automatically from a
one-line config:

```
api.yourdomain.tld {
    reverse_proxy 127.0.0.1:30130
}
```

Point `web`'s `PORTAL_API_URL` at `https://api.yourdomain.tld`.

## Auth model

Every route except `GET /health` and `GET /status` requires an
`x-sfos-portal-secret` header matching `PORTAL_API_SECRET` — a static
shared secret, same trust model as the main SFOS repo's
`services/discord-bot` `/log` endpoint. `GET /status` is the one
deliberately public, unauthenticated route (it's the live on-duty board's
data source and holds nothing sensitive). This API otherwise has no
browser-facing CORS surface: `web`'s server-side code (API routes / server
actions) is the only intended caller, and it's responsible for checking
the actual signed-in user's session/permissions *before* calling here.
Routes added in later phases that perform privileged actions should
re-derive the caller's current permissions from the database (given an
`accountId`), not trust any client-supplied claim — matching the "never
trust cached/client-supplied authorization" convention used throughout
this platform.

## Debug logging

Set `DEBUG=true` in `.env` (restart required) for verbose console output,
matching the main SFOS repo's `services/discord-bot` and the Lua side's
`sfos_debug` convention. Not yet wired to any log statements in Phase 1 —
reserved for later phases.
