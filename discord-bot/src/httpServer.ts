import express from "express";
import { Client } from "discord.js";
import { config } from "./config.js";
import { debugLog } from "./debug.js";

interface LogPayload {
  event: string;
  fields: Record<string, string>;
}

interface EventPresentation {
  title: string;
  color: number;
}

const EVENT_PRESENTATION: Record<string, EventPresentation> = {
  player_connected: { title: "🟢 Player Connected", color: 0x3fb27f },
  player_disconnected: { title: "🔴 Player Disconnected", color: 0xe0554a },
  character_created: { title: "🧑 Character Created", color: 0x2f7de1 },
  role_selected: { title: "🎭 Role Selected", color: 0x2f7de1 },
  permission_granted: { title: "✅ Permission Granted", color: 0x3fb27f },
  permission_revoked: { title: "❌ Permission Revoked", color: 0xe0554a },
  duty_started: { title: "🟢 On Duty", color: 0x3fb27f },
  duty_ended: { title: "🔴 Off Duty", color: 0xe0554a },
  agency_membership_hired: { title: "🎖️ Agency Hire", color: 0x3fb27f },
  agency_membership_fired: { title: "🎖️ Agency Termination", color: 0xe0554a },
  agency_membership_promoted: { title: "🎖️ Agency Rank Change", color: 0x2f7de1 },
  aop_changed: { title: "🗺️ AOP Changed", color: 0x2f7de1 },
  // Mirrors sfos-aop/server/main.lua's priority.status values exactly
  // ('available' | 'active' | 'cooldown' | 'hold') - PostLog builds the
  // event name as 'priority_' .. status, so these keys must match verbatim.
  priority_active: { title: "🚨 Priority Call Active", color: 0xe0554a },
  priority_cooldown: { title: "⏳ Priority Call Cooldown", color: 0xdba13a },
  priority_hold: { title: "⏸️ Priority Call On Hold", color: 0xdba13a },
  priority_available: { title: "✅ Priority Call Available", color: 0x3fb27f },
  incident_created: { title: "📋 Incident Opened", color: 0x2f7de1 },
  report_submitted: { title: "📝 Report Filed", color: 0x2f7de1 },
  warrant_issued: { title: "📜 Warrant Issued", color: 0xc9a227 },
  bolo_created: { title: "🚨 BOLO Issued", color: 0xe0554a },
  player_jailed: { title: "🔒 Player Jailed", color: 0xc9a227 },
  person_created: { title: "🆔 Person Record Created", color: 0x8b98a5 },
  player_downed: { title: "🩸 Player Downed", color: 0xe0554a },
  player_revived: { title: "💉 Player Revived", color: 0x3fb27f },
  // Website recruitment flow - pushed by portal-api (services/portal-api's
  // discordLog.ts), not FXServer. A department application submitted through
  // the website, and a staff accept/reject decision made in the admin
  // dashboard. Same /log contract as everything above.
  application_submitted: { title: "📨 Application Submitted", color: 0x2f7de1 },
  application_accepted: { title: "✅ Application Accepted", color: 0x3fb27f },
  application_rejected: { title: "❌ Application Rejected", color: 0xe0554a },
};

// Started only if a log channel is configured (see index.ts) - this is an
// optional feature, same graceful-degradation stance as the Lua side taking
// no action when sfos_discord_log_url/secret aren't set.
export function startLogHttpServer(client: Client): void {
  const app = express();
  app.use(express.json());

  app.post("/log", (req, res) => {
    const providedSecret = req.header("x-sfos-log-secret");
    if (!config.fxserver.logSecret || providedSecret !== config.fxserver.logSecret) {
      res.status(401).json({ ok: false, error: "unauthorized" });
      return;
    }

    const payload = req.body as Partial<LogPayload>;
    if (typeof payload?.event !== "string" || typeof payload.fields !== "object" || payload.fields === null) {
      res.status(400).json({ ok: false, error: "invalid_payload" });
      return;
    }

    debugLog("httpServer", `/log event=${payload.event} fields=${JSON.stringify(payload.fields)}`);
    res.json({ ok: true });
    void postLogEmbed(client, payload as LogPayload);
  });

  app.listen(config.bot.httpPort, () => {
    console.log(`[sfos-discord-bot] log HTTP server listening on port ${config.bot.httpPort}`);
  });
}

async function postLogEmbed(client: Client, payload: LogPayload): Promise<void> {
  try {
    const channel = await client.channels.fetch(config.discordLogChannelId);
    if (!channel || !channel.isTextBased() || !("send" in channel)) {
      console.warn(`[httpServer] configured log channel ${config.discordLogChannelId} isn't a sendable text channel`);
      return;
    }

    const presentation = EVENT_PRESENTATION[payload.event] ?? { title: payload.event, color: 0x8b98a5 };

    await channel.send({
      embeds: [
        {
          title: presentation.title,
          color: presentation.color,
          fields: Object.entries(payload.fields).map(([name, value]) => ({
            name,
            value: String(value),
            inline: true,
          })),
          timestamp: new Date().toISOString(),
        },
      ],
    });
  } catch (err) {
    console.error(`[httpServer] failed to post log embed for event=${payload.event}:`, err);
  }
}
