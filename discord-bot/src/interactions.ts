import { type ChatInputCommandInteraction, type Client, Events } from "discord.js";
import {
  getAccountSummary,
  getAllPermissions,
  getCharactersForAccount,
  grantManualPermission,
  revokeManualPermission,
} from "./db.js";
import { notifyFxServer } from "./fxsync.js";
import { debugLog } from "./debug.js";

async function handleGrantPermission(interaction: ChatInputCommandInteraction): Promise<void> {
  const target = interaction.options.getUser("player", true);
  const permission = interaction.options.getString("permission", true);

  const account = await getAccountSummary(target.id);
  if (!account) {
    await interaction.reply({ content: `${target.tag} has never connected to the server — no linked account.`, ephemeral: true });
    return;
  }

  await grantManualPermission(account.account_id, permission);
  await notifyFxServer(target.id);
  await interaction.reply({
    content: `Granted \`${permission}\` to ${target.tag} (account #${account.account_id}).`,
    ephemeral: true,
  });
}

async function handleRevokePermission(interaction: ChatInputCommandInteraction): Promise<void> {
  const target = interaction.options.getUser("player", true);
  const permission = interaction.options.getString("permission", true);

  const account = await getAccountSummary(target.id);
  if (!account) {
    await interaction.reply({ content: `${target.tag} has never connected to the server — no linked account.`, ephemeral: true });
    return;
  }

  await revokeManualPermission(account.account_id, permission);
  await notifyFxServer(target.id);
  await interaction.reply({
    content:
      `Revoked \`${permission}\` from ${target.tag} (account #${account.account_id}). ` +
      "Note: if their Discord role still maps to this permission, the next role sync will re-grant it.",
    ephemeral: true,
  });
}

async function handleLookupPlayer(interaction: ChatInputCommandInteraction): Promise<void> {
  const target = interaction.options.getUser("player", true);

  const account = await getAccountSummary(target.id);
  if (!account) {
    await interaction.reply({ content: `${target.tag} has never connected to the server — no linked account.`, ephemeral: true });
    return;
  }

  const [permissions, characters] = await Promise.all([
    getAllPermissions(account.account_id),
    getCharactersForAccount(account.account_id),
  ]);

  const permissionLines =
    permissions.length > 0 ? permissions.map((p) => `\`${p.permission}\` (${p.source})`).join("\n") : "None";
  const characterLines =
    characters.length > 0
      ? characters
          .map((c) => `${c.first_name} ${c.last_name} — ${c.agency_code ?? "Civilian"} (${c.duty_status})`)
          .join("\n")
      : "None";

  await interaction.reply({
    ephemeral: true,
    embeds: [
      {
        title: `Account #${account.account_id}`,
        fields: [
          { name: "FiveM Username", value: account.fivem_username },
          { name: "Permissions", value: permissionLines },
          { name: "Characters", value: characterLines },
        ],
      },
    ],
  });
}

export function registerInteractionHandlers(client: Client): void {
  client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) {
      return;
    }

    try {
      debugLog(
        "interactions",
        `/${interaction.commandName} from ${interaction.user.tag} options=${JSON.stringify(interaction.options.data)}`,
      );

      if (interaction.commandName === "grant-permission") {
        await handleGrantPermission(interaction);
      } else if (interaction.commandName === "revoke-permission") {
        await handleRevokePermission(interaction);
      } else if (interaction.commandName === "lookup-player") {
        await handleLookupPlayer(interaction);
      }
    } catch (err) {
      console.error(`[interactions] error handling ${interaction.commandName}:`, err);
      const failureMessage = { content: "Something went wrong running that command.", ephemeral: true };
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp(failureMessage);
      } else {
        await interaction.reply(failureMessage);
      }
    }
  });
}
