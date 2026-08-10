import { Client, Events, GatewayIntentBits, Partials } from "discord.js";
import { config } from "./config.js";
import { revokeAllDiscordPermissions, syncMemberPermissions } from "./roleSync.js";
import { registerCommands } from "./registerCommands.js";
import { registerInteractionHandlers } from "./interactions.js";
import { startLogHttpServer } from "./httpServer.js";
import { startStatusAnnouncer } from "./statusAnnouncer.js";

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
  partials: [Partials.GuildMember],
});

registerInteractionHandlers(client);

client.once(Events.ClientReady, async (readyClient) => {
  console.log(`[sfos-discord-bot] logged in as ${readyClient.user.tag}`);

  try {
    await registerCommands();
  } catch (err) {
    console.error("[sfos-discord-bot] failed to register slash commands:", err);
  }

  // Optional feature - only start the log HTTP server if a channel is
  // actually configured, matching the Lua side's own no-op-when-unset stance.
  if (config.discordLogChannelId) {
    startLogHttpServer(readyClient);
  } else {
    console.log("[sfos-discord-bot] DISCORD_LOG_CHANNEL_ID not set, skipping audit log server");
  }

  // Optional website feature - the live on-duty status board. Needs both a
  // channel to post in and a portal-api URL to poll; skip entirely otherwise.
  if (config.status.channelId && config.status.portalApiUrl) {
    startStatusAnnouncer(readyClient);
  } else {
    console.log("[sfos-discord-bot] status board not configured (DISCORD_STATUS_CHANNEL_ID/PORTAL_API_URL), skipping");
  }

  const guild = await readyClient.guilds.fetch(config.discordGuildId);
  const members = await guild.members.fetch();

  console.log(`[sfos-discord-bot] running initial role sync for ${members.size} members...`);
  for (const member of members.values()) {
    try {
      await syncMemberPermissions(member);
    } catch (err) {
      console.error(`[sfos-discord-bot] failed initial sync for ${member.id}:`, err);
    }
  }
  console.log("[sfos-discord-bot] initial role sync complete");
});

client.on(Events.GuildMemberUpdate, async (_oldMember, newMember) => {
  try {
    await syncMemberPermissions(await newMember.fetch());
  } catch (err) {
    console.error(`[sfos-discord-bot] failed to sync ${newMember.id}:`, err);
  }
});

client.on(Events.GuildMemberRemove, async (member) => {
  try {
    await revokeAllDiscordPermissions(member.id);
  } catch (err) {
    console.error(`[sfos-discord-bot] failed to revoke permissions for departing member ${member.id}:`, err);
  }
});

client.login(config.discordBotToken);
