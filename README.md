# KCRP Website

Kiwi Cove Roleplay's public website, player portal, staff admin dashboard,
and emergency-department (PD/FENZ/HHSJ) recruitment + live status portal.

A pnpm workspace with three deployable services:

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
- [`discord-bot/`](discord-bot/) — Express + discord.js process, ported from
  the game-server repo (`SFRP_Core`)'s `services/discord-bot` and deployed on
  the same game-server host (it needs direct MySQL access). Syncs Discord
  roles into `permission_grants`, offers staff slash commands, and — for the
  website — posts recruitment-application events (pushed by `portal-api`) and
  keeps a live on-duty status board (polled from `portal-api`'s public
  `/status`) in Discord. See its README.

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
pnpm --filter sfos-discord-bot dev  # terminal 3 (optional, needs a Discord bot + game MySQL)
```

Each service needs its own `.env`/`.env.local` — copy `.env.example` in
each directory and fill in real values (see the respective READMEs).
