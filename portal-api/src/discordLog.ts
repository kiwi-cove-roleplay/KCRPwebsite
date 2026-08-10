import { config } from "./config.js";
import { logDebug, logError } from "./logger.js";

// Best-effort push of a website event to the discord-bot's /log HTTP server
// (services/discord-bot/src/httpServer.ts), using the same shared-secret
// contract FXServer's audit log uses. Purely a notification: if the bot is
// down, unreachable, or simply not configured, we log and move on - the
// database write that triggered this already succeeded, and nothing about
// the request depends on Discord receiving it.
//
// Fire-and-forget: callers `void notifyDiscordLog(...)` rather than await it,
// so a slow or hanging bot never delays the HTTP response to the web app.
export function notifyDiscordLog(event: string, fields: Record<string, string>): void {
  if (!config.discordLog.url || !config.discordLog.secret) {
    // Feature not configured - silently skip, same stance as the bot itself
    // when DISCORD_LOG_CHANNEL_ID is unset.
    return;
  }

  void (async () => {
    try {
      const resp = await fetch(config.discordLog.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-sfos-log-secret": config.discordLog.secret,
        },
        body: JSON.stringify({ event, fields }),
      });
      if (!resp.ok) {
        logDebug(`discord-bot /log responded ${resp.status} for event=${event}`);
      } else {
        logDebug(`notified discord-bot: event=${event}`);
      }
    } catch (err) {
      logError("notifyDiscordLog", err);
    }
  })();
}
