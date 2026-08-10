# sfos-discord-bot

Standalone Node.js process (not a FiveM resource). Ported from the main SFOS
repo (`SFRP_Core`)'s `services/discord-bot` into this website workspace, with
extra website integration. Runs on the game-server host, same as `portal-api`
(it needs direct MySQL access to the game database).

Jobs:
1. **Role sync** — keeps `permission_grants` in sync with Discord role
   membership. This is what the website means by "sync Discord roles": grants
   flow Discord role → `permission_grants`, and the website (via `portal-api`)
   reads those same permissions on sign-in.
2. **Slash commands** (`/grant-permission`, `/revoke-permission`,
   `/lookup-player`) for staff to manage a linked player's permissions.
3. **Audit log** (optional) — posts an embed to a Discord channel for game
   events (connect/disconnect, character creation, duty status, etc.) **and**
   for website recruitment events (see below).
4. **Live status board** (optional, website) — keeps a single message in a
   channel up to date by polling `portal-api`'s public `GET /status`.

## Website integration

Two of the four jobs above are the website-support additions on top of the
ported bot:

- **Application events** — when someone submits a department application on
  the website, or a staff member accepts/rejects one in the admin dashboard,
  `portal-api` pushes an event to this bot's `/log` HTTP server (the same
  endpoint and shared-secret contract FXServer's audit log uses). It renders
  as an embed (`📨 Application Submitted`, `✅ Application Accepted`,
  `❌ Application Rejected`) in the `DISCORD_LOG_CHANNEL_ID` channel. Requires
  the audit log to be configured, plus `portal-api`'s `DISCORD_LOG_URL` /
  `DISCORD_LOG_SECRET` (the secret must match this bot's `FXSERVER_LOG_SECRET`).
- **Live status board** — this bot polls `portal-api`'s public `GET /status`
  every `STATUS_POLL_SECONDS` and edits one message in
  `DISCORD_STATUS_CHANNEL_ID`. No secret needed (`/status` is public). It only
  edits when the snapshot's `updatedAt` changes, and re-uses its own most
  recent board message across restarts rather than posting duplicates.

Both are opt-in: leave `DISCORD_STATUS_CHANNEL_ID` (status board) or
`DISCORD_LOG_CHANNEL_ID` (application events) blank to skip that feature, same
graceful-degradation stance as the rest of the platform.

## Setup

1. Create a Discord application/bot at https://discord.com/developers/applications.
2. Under **Bot**, enable the **Server Members Intent** (privileged) — required
   to read role membership. Copy the bot token, and copy the **Application ID**
   from General Information (this is `DISCORD_CLIENT_ID`, not the bot token).
3. Invite the bot with both the `bot` and `applications.commands` scopes.
4. Copy `.env.example` to `.env` and fill in `DISCORD_BOT_TOKEN`,
   `DISCORD_CLIENT_ID`, `DISCORD_GUILD_ID`, DB credentials, and
   `FXSERVER_SYNC_URL`/`FXSERVER_SYNC_SECRET`. For the website features, also
   set `DISCORD_LOG_CHANNEL_ID` + `FXSERVER_LOG_SECRET` (application events)
   and `DISCORD_STATUS_CHANNEL_ID` + `PORTAL_API_URL` (status board).
5. Populate `discord_role_mappings` (see the main SFOS repo's
   `database/migrations/0002_permissions.sql`) with your Discord role IDs
   mapped to `sfos.role.*` permissions.
6. `pnpm install` (from repo root), then `pnpm --filter sfos-discord-bot dev`
   for local iteration, or `pnpm --filter sfos-discord-bot build && pnpm
   --filter sfos-discord-bot start` to run compiled.

Slash commands are registered automatically (guild-scoped) on every start.

## Debug logging

Set `DEBUG=true` in `.env` (restart required) for verbose console output:
role sync decisions, slash command invocations, `/log` payloads received,
FXServer notification results, and status board polling.
