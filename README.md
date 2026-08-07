# KCRP Website

Kiwi Cove Roleplay's public website, player portal, staff admin dashboard,
and emergency-department (PD/FENZ/HHSJ) recruitment + live status portal.

A pnpm workspace with two deployable services, each owning its own
database:

- [`web/`](web/) — Next.js (App Router) app, deployed to Vercel. Public
  site, player portal, admin dashboard, all gated by a Discord-OAuth
  session. Owns its own Postgres database for website accounts (via
  Prisma — see `web/prisma/schema.prisma`), so signing in works whether or
  not that Discord account has ever played on the FiveM server. Never
  touches the game's MySQL database directly.
- [`portal-api/`](portal-api/) — Express API, deployed on the game
  server's Windows Server host (as a Windows Service — see its README)
  since that's where FXServer runs. Holds the one MySQL credential and is
  `web`'s only path to the SFOS database, called server-side over HTTPS
  with a shared secret. `web` calls it once per sign-in as a best-effort
  enrichment step (game account id, permissions, staff status, characters)
  — it's never required for the website login itself to succeed.

See each service's README for local setup and deployment. This repo is
intentionally separate from the FiveM/game-server (`SFRP_Core`) repo — see
that repo's design doc ("Community Web Platform") for the full
architecture, trust model, phased build plan, and database reference this
was scaffolded from.

## Getting started

```bash
pnpm install
pnpm --filter sfos-portal-api dev   # terminal 1
pnpm --filter sfos-web dev          # terminal 2
```

Each service needs its own `.env`/`.env.local` — copy `.env.example` in
each directory and fill in real values (see the respective READMEs).
