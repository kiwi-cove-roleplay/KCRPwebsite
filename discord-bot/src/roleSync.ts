import type { GuildMember } from "discord.js";
import {
  getAccountIdByDiscordId,
  getActiveRoleMappings,
  getDiscordSourcedPermissions,
  grantDiscordPermission,
  revokeDiscordPermission,
} from "./db.js";
import { notifyFxServer } from "./fxsync.js";
import { debugLog } from "./debug.js";

// Discord roles drive account-level permission_grants ONLY — never
// agency_ranks/character_agency_memberships. Discord identifies an account
// (a person), never a specific character; in-game rank/career progression
// stays a character-level, in-game concern. See docs/architecture.md.
export async function syncMemberPermissions(member: GuildMember): Promise<void> {
  const accountId = await getAccountIdByDiscordId(member.id);
  if (!accountId) {
    // This Discord user has never connected to the server, so there's no
    // account row yet. Their permissions will be correct from DB the moment
    // they do connect (accounts.discord_identifier gets set on first login,
    // but there is nothing to sync into until then).
    debugLog("roleSync", `discord ${member.id} has no linked account, skipping`);
    return;
  }

  const mappings = await getActiveRoleMappings();
  const desired = new Set<string>();
  for (const mapping of mappings) {
    if (member.roles.cache.has(mapping.discord_role_id)) {
      desired.add(mapping.permission);
    }
  }

  const current = await getDiscordSourcedPermissions(accountId);
  debugLog("roleSync", `account ${accountId}: desired=[${[...desired].join(", ")}] current=[${[...current].join(", ")}]`);

  const toGrant = [...desired].filter((permission) => !current.has(permission));
  const toRevoke = [...current].filter((permission) => !desired.has(permission));

  if (toGrant.length === 0 && toRevoke.length === 0) {
    debugLog("roleSync", `account ${accountId}: no change`);
    return;
  }

  await Promise.all([
    ...toGrant.map((permission) => grantDiscordPermission(accountId, permission)),
    ...toRevoke.map((permission) => revokeDiscordPermission(accountId, permission)),
  ]);

  console.log(
    `[roleSync] account ${accountId} (discord ${member.id}): +[${toGrant.join(", ")}] -[${toRevoke.join(", ")}]`,
  );

  await notifyFxServer(member.id);
}

// On leaving the guild entirely, pull every Discord-sourced permission —
// manual grants (source='manual') are untouched, since those were an
// explicit in-game admin decision, not Discord's to revoke.
export async function revokeAllDiscordPermissions(discordId: string): Promise<void> {
  const accountId = await getAccountIdByDiscordId(discordId);
  if (!accountId) {
    return;
  }

  const current = await getDiscordSourcedPermissions(accountId);
  if (current.size === 0) {
    return;
  }

  await Promise.all([...current].map((permission) => revokeDiscordPermission(accountId, permission)));
  console.log(`[roleSync] account ${accountId} (discord ${discordId}) left guild, revoked: [${[...current].join(", ")}]`);

  await notifyFxServer(discordId);
}
