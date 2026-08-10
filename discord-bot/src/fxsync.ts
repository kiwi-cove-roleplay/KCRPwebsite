import { config } from "./config.js";
import { debugLog } from "./debug.js";

// Best-effort live push so an online player's permission cache updates
// immediately. If FXServer is down or unreachable, the DB write we already
// made is still correct — the player's next connect reads fresh from DB
// regardless, so a failure here is logged, not thrown.
export async function notifyFxServer(discordId: string): Promise<void> {
  try {
    const resp = await fetch(config.fxserver.syncUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-sfos-secret": config.fxserver.syncSecret,
      },
      body: JSON.stringify({ discordId }),
    });

    if (!resp.ok) {
      console.warn(`[fxsync] FXServer responded ${resp.status} for discordId=${discordId}`);
    } else {
      debugLog("fxsync", `notified FXServer for discordId=${discordId}, status=${resp.status}`);
    }
  } catch (err) {
    console.warn(`[fxsync] could not reach FXServer for discordId=${discordId}:`, err);
  }
}
