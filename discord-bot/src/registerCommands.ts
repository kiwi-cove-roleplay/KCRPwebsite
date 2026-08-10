import { REST, Routes } from "discord.js";
import { config } from "./config.js";
import { commands } from "./commands.js";

// Guild-scoped registration (not global) so commands appear instantly during
// development instead of the up-to-an-hour global command propagation delay.
export async function registerCommands(): Promise<void> {
  const rest = new REST().setToken(config.discordBotToken);
  await rest.put(Routes.applicationGuildCommands(config.discordClientId, config.discordGuildId), {
    body: commands,
  });
  console.log(`[sfos-discord-bot] registered ${commands.length} guild slash commands`);
}
