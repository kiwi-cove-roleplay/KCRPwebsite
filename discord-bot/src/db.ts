import mysql from "mysql2/promise";
import { config } from "./config.js";

// Same MySQL database sfos-core reads from via oxmysql. This bot writes
// directly to permission_grants; sfos-core's cache is refreshed by the
// HTTP notification in fxsync.ts, not by this pool.
export const pool = mysql.createPool({
  host: config.db.host,
  port: config.db.port,
  user: config.db.user,
  password: config.db.password,
  database: config.db.database,
  waitForConnections: true,
  connectionLimit: 5,
});

export interface RoleMapping {
  discord_role_id: string;
  permission: string;
}

export async function getActiveRoleMappings(): Promise<RoleMapping[]> {
  const [rows] = await pool.query<mysql.RowDataPacket[]>(
    "SELECT discord_role_id, permission FROM discord_role_mappings WHERE is_active = 1",
  );
  return rows as RoleMapping[];
}

export async function getAccountIdByDiscordId(discordId: string): Promise<number | null> {
  const [rows] = await pool.query<mysql.RowDataPacket[]>(
    "SELECT account_id FROM accounts WHERE discord_identifier = ? LIMIT 1",
    [discordId],
  );
  return rows.length > 0 ? (rows[0].account_id as number) : null;
}

export async function getDiscordSourcedPermissions(accountId: number): Promise<Set<string>> {
  const [rows] = await pool.query<mysql.RowDataPacket[]>(
    "SELECT permission FROM permission_grants WHERE account_id = ? AND source = 'discord'",
    [accountId],
  );
  return new Set(rows.map((row) => row.permission as string));
}

export async function grantDiscordPermission(accountId: number, permission: string): Promise<void> {
  // Deliberately does NOT overwrite `source` on conflict: if this permission
  // was already granted manually by an admin, it must stay 'manual' so a
  // later Discord role removal doesn't incorrectly revoke it (see
  // revokeDiscordPermission and roleSync.ts's "manual grants are untouched"
  // comment). Only a fresh INSERT ever sets source = 'discord'.
  await pool.query(
    "INSERT INTO permission_grants (account_id, permission, granted_by, source) VALUES (?, ?, NULL, 'discord') " +
      "ON DUPLICATE KEY UPDATE granted_at = NOW()",
    [accountId, permission],
  );
}

export async function revokeDiscordPermission(accountId: number, permission: string): Promise<void> {
  await pool.query("DELETE FROM permission_grants WHERE account_id = ? AND permission = ? AND source = 'discord'", [
    accountId,
    permission,
  ]);
}

export interface AccountSummary {
  account_id: number;
  fivem_username: string;
  created_at: string;
}

export async function getAccountSummary(discordId: string): Promise<AccountSummary | null> {
  const [rows] = await pool.query<mysql.RowDataPacket[]>(
    "SELECT account_id, fivem_username, created_at FROM accounts WHERE discord_identifier = ? LIMIT 1",
    [discordId],
  );
  return rows.length > 0 ? (rows[0] as AccountSummary) : null;
}

export interface PermissionRow {
  permission: string;
  source: "manual" | "discord";
}

export async function getAllPermissions(accountId: number): Promise<PermissionRow[]> {
  const [rows] = await pool.query<mysql.RowDataPacket[]>(
    "SELECT permission, source FROM permission_grants WHERE account_id = ? ORDER BY permission",
    [accountId],
  );
  return rows as PermissionRow[];
}

export interface CharacterSummary {
  character_id: number;
  first_name: string;
  last_name: string;
  agency_code: string | null;
  duty_status: "on_duty" | "off_duty";
}

export async function getCharactersForAccount(accountId: number): Promise<CharacterSummary[]> {
  const [rows] = await pool.query<mysql.RowDataPacket[]>(
    "SELECT character_id, first_name, last_name, agency_code, duty_status FROM characters "
      + "WHERE account_id = ? AND status = 'active' ORDER BY last_played_at DESC",
    [accountId],
  );
  return rows as CharacterSummary[];
}

// Slash-command-issued grants ARE explicit staff decisions, unlike the
// Discord-role auto-sync ones - so unlike grantDiscordPermission, this one
// deliberately DOES set source = 'manual' on conflict too.
export async function grantManualPermission(accountId: number, permission: string): Promise<void> {
  await pool.query(
    "INSERT INTO permission_grants (account_id, permission, granted_by, source) VALUES (?, ?, NULL, 'manual') "
      + "ON DUPLICATE KEY UPDATE source = 'manual', granted_at = NOW()",
    [accountId, permission],
  );
}

export async function revokeManualPermission(accountId: number, permission: string): Promise<void> {
  await pool.query("DELETE FROM permission_grants WHERE account_id = ? AND permission = ?", [accountId, permission]);
}
