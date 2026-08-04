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

- `/admin/*` — the Phase 4 admin dashboard's backend, mirroring the main
  SFOS repo's `resources/[admin]/sfos-admin` (`server/db.lua`) for the
  subset this platform covers: `GET /admin/accounts/search`,
  `GET/POST /admin/bans`, `POST /admin/bans/:accountId/unban`,
  `GET/POST /admin/accounts/:accountId/notes`,
  `GET /admin/permission-catalog`,
  `GET/POST /admin/accounts/:accountId/permissions`,
  `DELETE /admin/accounts/:accountId/permissions/:permission`,
  `GET/POST /admin/staff`, `PATCH/DELETE /admin/staff/:accountId`,
  `GET /admin/staff-actions`, `GET /admin/applications`,
  `POST /admin/applications/:id`. Every one of these requires the shared
  secret *and* an `x-sfos-actor-account-id` header identifying the acting
  admin — re-checked against `sfos.staff.admin` in `permission_grants` on
  every single request (see `index.ts`'s `adminRouter` middleware), not
  trusted from anything cached client-side. `web`'s admin API routes are
  the only intended source for that header, and they derive it solely from
  the caller's own session — never from client-submitted input, since a
  spoofed header here would let a non-admin claim to be any account id.
  Every mutation logs a `staff_actions` row. The admin routes assume
  `sfos.staff.admin` has already been granted to at least one account
  (e.g. through the FiveM `sfos-admin` menu, or a manual `permission_grants`
  row) — there's no bootstrap path here the way `sfos-admin`'s ACE-group
  fallback provides in-game.

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

## Running on Windows Server (production)

The game server host here is Windows Server, not Linux, so this runs as a
Windows Service via [node-windows](https://github.com/coreybutler/node-windows)
(a devDependency, only ever used by the install script below — never
imported by `src/index.ts` itself, since merely `require`-ing it throws on
any non-Windows platform).

```powershell
pnpm install
pnpm --filter sfos-portal-api build
```

Then, from an **elevated** (Run as Administrator) PowerShell or cmd:

```powershell
pnpm --filter sfos-portal-api service:install
```

This installs and starts a service named `sfos-portal-api` that restarts
automatically on crash or reboot. Manage it from `services.msc`, or:

```powershell
net start sfos-portal-api
net stop sfos-portal-api
pnpm --filter sfos-portal-api service:uninstall   # remove it
```

Logs go to the Windows Event Log (Application) under the service name -
node-windows wraps stdout/stderr there since there's no journald equivalent.

To deploy an update later:

```powershell
git pull
pnpm install
pnpm --filter sfos-portal-api build
net stop sfos-portal-api
net start sfos-portal-api
```

### Reverse proxy (required)

This API is hit by `web` running on Vercel — over the public internet, so
it needs real TLS in front of it on a subdomain you control (e.g.
`api.yourdomain.tld`), not the bare HTTP the game server's other
localhost-only traffic gets away with. [Caddy](https://caddyserver.com/)
has a native Windows binary and provisions a Let's Encrypt certificate
automatically from the same one-line config as anywhere else:

```
api.yourdomain.tld {
    reverse_proxy 127.0.0.1:30130
}
```

Run `caddy.exe run` with that `Caddyfile`, or wrap Caddy itself as a
Windows Service the same way (`caddy.exe` has its own `windows-service`
support - see Caddy's docs). Point `web`'s `PORTAL_API_URL` at
`https://api.yourdomain.tld`.

### Running on a Linux VPS instead

If `portal-api` ever moves to a Linux host, the same pattern as the main
SFOS repo's `services/discord-bot` applies: `sudo bash
portal-api/deploy/install.sh` installs a systemd unit (`systemctl status
sfos-portal-api`, `journalctl -u sfos-portal-api -f`), and the same Caddy
config above works unchanged.

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
`/admin/*` is where this actually happens (Phase 4): every request there
re-derives `sfos.staff.admin` from `permission_grants` for the
`x-sfos-actor-account-id` given, on every single call, rather than trusting
anything cached client-side — matching the "never trust cached/client-
supplied authorization" convention used throughout this platform.

## Debug logging

Set `DEBUG=true` in `.env` (restart required) for verbose console output,
matching the main SFOS repo's `services/discord-bot` and the Lua side's
`sfos_debug` convention. Not yet wired to any log statements in Phase 1 —
reserved for later phases.
