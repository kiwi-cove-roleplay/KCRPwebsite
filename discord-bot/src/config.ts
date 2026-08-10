import "dotenv/config";

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

export const config = {
  debug: process.env.DEBUG === "true",
  discordBotToken: required("DISCORD_BOT_TOKEN"),
  discordClientId: required("DISCORD_CLIENT_ID"),
  discordGuildId: required("DISCORD_GUILD_ID"),
  discordLogChannelId: process.env.DISCORD_LOG_CHANNEL_ID ?? "",
  db: {
    host: process.env.DB_HOST ?? "127.0.0.1",
    port: Number(process.env.DB_PORT ?? 3306),
    user: required("DB_USER"),
    password: process.env.DB_PASSWORD ?? "",
    database: required("DB_NAME"),
  },
  fxserver: {
    syncUrl: required("FXSERVER_SYNC_URL"),
    syncSecret: required("FXSERVER_SYNC_SECRET"),
    logSecret: process.env.FXSERVER_LOG_SECRET ?? "",
  },
  bot: {
    httpPort: Number(process.env.BOT_HTTP_PORT ?? 30121),
  },
  // Website integration - the live on-duty status board. The bot polls
  // portal-api's PUBLIC GET /status (no secret needed) and edits a single
  // message in the configured channel. Both must be set to enable it; leave
  // DISCORD_STATUS_CHANNEL_ID blank to skip the feature entirely, the same
  // graceful-degradation stance as the audit-log server.
  status: {
    channelId: process.env.DISCORD_STATUS_CHANNEL_ID ?? "",
    portalApiUrl: process.env.PORTAL_API_URL ?? "",
    pollSeconds: Number(process.env.STATUS_POLL_SECONDS ?? 60),
  },
};
