import { type APIEmbed, type APIEmbedField, type Client, type Message } from "discord.js";
import { config } from "./config.js";
import { debugLog } from "./debug.js";

// Marker put in the embed footer so we can find and re-use our own status
// message across bot restarts instead of posting a fresh one every time.
const BOARD_MARKER = "sfos-status-board";

interface StatusResponse {
  data: unknown;
  updatedAt: string | null;
}

// The bot polls portal-api's PUBLIC GET /status (no shared secret) and keeps
// a single channel message up to date. Fully decoupled from portal-api - if
// portal-api is unreachable, we just leave the last message as-is and retry
// on the next tick. Started only when both DISCORD_STATUS_CHANNEL_ID and
// PORTAL_API_URL are set (see index.ts).
export function startStatusAnnouncer(client: Client): void {
  let boardMessage: Message | null = null;
  let lastRenderedAt: string | null = null;

  async function tick(): Promise<void> {
    let status: StatusResponse;
    try {
      const resp = await fetch(`${config.status.portalApiUrl.replace(/\/$/, "")}/status`);
      if (!resp.ok) {
        debugLog("status", `portal-api /status responded ${resp.status}`);
        return;
      }
      status = (await resp.json()) as StatusResponse;
    } catch (err) {
      // portal-api down/unreachable - leave the existing board untouched.
      debugLog("status", `could not reach portal-api /status: ${String(err)}`);
      return;
    }

    // Nothing changed since the last successful render - skip the edit so we
    // don't burn Discord's rate limit on identical content. A null updatedAt
    // (no push received yet) still renders once so the board isn't blank.
    const stamp = status.updatedAt ?? "null";
    if (stamp === lastRenderedAt) {
      debugLog("status", "no change since last render, skipping");
      return;
    }

    const embed = buildStatusEmbed(status);
    try {
      if (!boardMessage) {
        boardMessage = await findOrCreateBoardMessage(client, embed);
      } else {
        await boardMessage.edit({ embeds: [embed] });
      }
      lastRenderedAt = stamp;
      debugLog("status", `board updated (updatedAt=${status.updatedAt})`);
    } catch (err) {
      console.error("[status] failed to update status board message:", err);
      // Drop the cached handle so the next tick re-resolves it (e.g. if the
      // message was deleted out from under us).
      boardMessage = null;
    }
  }

  void tick();
  setInterval(() => void tick(), Math.max(15, config.status.pollSeconds) * 1000);
  console.log(
    `[sfos-discord-bot] status board polling portal-api every ${config.status.pollSeconds}s -> channel ${config.status.channelId}`,
  );
}

async function findOrCreateBoardMessage(client: Client, embed: APIEmbed): Promise<Message> {
  const channel = await client.channels.fetch(config.status.channelId);
  if (!channel || !channel.isTextBased() || !("send" in channel)) {
    throw new Error(`status channel ${config.status.channelId} isn't a sendable text channel`);
  }

  // Re-use our own most recent board message if one already exists, so a bot
  // restart edits it in place rather than leaving orphaned boards behind.
  const recent = await channel.messages.fetch({ limit: 20 });
  const existing = recent.find(
    (msg) => msg.author.id === client.user?.id && msg.embeds[0]?.footer?.text === BOARD_MARKER,
  );
  if (existing) {
    return existing.edit({ embeds: [embed] });
  }
  return channel.send({ embeds: [embed] });
}

function buildStatusEmbed(status: StatusResponse): APIEmbed {
  const fields = renderFields(status.data);
  const hasData = fields.length > 0;
  return {
    title: "🚓 Live On-Duty Status",
    color: hasData ? 0x3fb27f : 0x8b98a5,
    description: hasData ? undefined : "No live status has been reported yet.",
    fields,
    footer: { text: BOARD_MARKER },
    timestamp: status.updatedAt ?? new Date().toISOString(),
  };
}

// The /status payload shape is whatever the Lua GetOnDutyCounts() returns -
// portal-api stores and echoes it as-is (see its statusStore.ts), so render
// defensively rather than assuming a fixed schema. Flat objects become one
// field per key; anything else is stringified into a single field.
function renderFields(data: unknown): APIEmbedField[] {
  if (data === null || data === undefined) {
    return [];
  }
  if (typeof data === "object" && !Array.isArray(data)) {
    return Object.entries(data as Record<string, unknown>).map(([name, value]) => ({
      name,
      value: formatValue(value),
      inline: true,
    }));
  }
  return [{ name: "Status", value: formatValue(data) }];
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined) {
    return "—";
  }
  if (typeof value === "object") {
    // Truncate to Discord's 1024-char field-value limit.
    return "```json\n" + JSON.stringify(value, null, 2).slice(0, 1000) + "\n```";
  }
  return String(value);
}
