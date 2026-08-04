import mysql from "mysql2/promise";
import { pool } from "./db.js";
import type { ApplicationStatus, DepartmentCode } from "./db.js";

// Mirrors the main SFOS repo's resources/[admin]/sfos-admin/server/db.lua -
// same tables, same query shapes - for the subset of the admin menu this
// platform's Phase 4 covers (bans, player notes, staff roster, permission
// grants, the audit log, and recruitment application review). Vehicle/
// weapon catalog CRUD, AOP, jail, and in-game player actions (teleport/
// kick) stay FiveM-only - there's no "src" concept here to act on.

// === Accounts (search, since there's no online-player roster here) ========

export interface AccountSearchResult {
  account_id: number;
  fivem_username: string;
  discord_identifier: string | null;
  is_banned: boolean;
}

export async function searchAccounts(query: string): Promise<AccountSearchResult[]> {
  const numericId = /^\d+$/.test(query) ? Number(query) : null;
  const [rows] = await pool.query<mysql.RowDataPacket[]>(
    "SELECT account_id, fivem_username, discord_identifier, is_banned FROM accounts "
      + "WHERE fivem_username LIKE ? OR account_id = ? ORDER BY fivem_username LIMIT 25",
    [`%${query}%`, numericId],
  );
  return rows.map((row) => ({ ...row, is_banned: Boolean(row.is_banned) })) as AccountSearchResult[];
}

// === Staff action audit log (staff_actions) ================================

export async function logStaffAction(
  actorAccountId: number,
  action: string,
  targetType: string | null,
  targetId: string | null,
  details: string | null,
): Promise<void> {
  await pool.query(
    "INSERT INTO staff_actions (actor_account_id, action, target_type, target_id, details) VALUES (?, ?, ?, ?, ?)",
    [actorAccountId, action, targetType, targetId, details],
  );
}

export interface StaffActionRow {
  id: number;
  action: string;
  target_type: string | null;
  target_id: string | null;
  details: string | null;
  created_at: Date;
  actor_name: string | null;
}

export async function listStaffActions(limit = 100): Promise<StaffActionRow[]> {
  const [rows] = await pool.query<mysql.RowDataPacket[]>(
    "SELECT sa.id, sa.action, sa.target_type, sa.target_id, sa.details, sa.created_at, "
      + "a.fivem_username AS actor_name "
      + "FROM staff_actions sa "
      + "LEFT JOIN accounts a ON a.account_id = sa.actor_account_id "
      + "ORDER BY sa.created_at DESC LIMIT ?",
    [limit],
  );
  return rows as StaffActionRow[];
}

// === Bans (accounts.is_banned/ban_reason/banned_by/banned_at/ban_expires_at)

export async function banAccount(
  accountId: number,
  reason: string,
  bannedBy: number,
  expiresAt: string | null,
): Promise<void> {
  await pool.query(
    "UPDATE accounts SET is_banned = 1, ban_reason = ?, banned_by = ?, banned_at = NOW(), ban_expires_at = ? "
      + "WHERE account_id = ?",
    [reason, bannedBy, expiresAt, accountId],
  );
}

export async function unbanAccount(accountId: number): Promise<void> {
  await pool.query("UPDATE accounts SET is_banned = 0, ban_expires_at = NULL WHERE account_id = ?", [accountId]);
}

export interface BannedAccountRow {
  account_id: number;
  fivem_username: string;
  ban_reason: string | null;
  banned_at: Date;
  ban_expires_at: Date | null;
  banned_by_name: string | null;
}

// Active bans only - an expired ban shouldn't show up asking to be
// unbanned, it already isn't enforced (matches sfos-core's GetBanStatus).
export async function listBannedAccounts(): Promise<BannedAccountRow[]> {
  const [rows] = await pool.query<mysql.RowDataPacket[]>(
    "SELECT b.account_id, b.fivem_username, b.ban_reason, b.banned_at, b.ban_expires_at, "
      + "banner.fivem_username AS banned_by_name "
      + "FROM accounts b "
      + "LEFT JOIN accounts banner ON banner.account_id = b.banned_by "
      + "WHERE b.is_banned = 1 AND (b.ban_expires_at IS NULL OR b.ban_expires_at > NOW()) "
      + "ORDER BY b.banned_at DESC",
  );
  return rows as BannedAccountRow[];
}

// === Player notes (player_notes) ===========================================

export interface PlayerNoteRow {
  id: number;
  note: string;
  created_at: Date;
  author_name: string | null;
}

export async function listPlayerNotes(accountId: number): Promise<PlayerNoteRow[]> {
  const [rows] = await pool.query<mysql.RowDataPacket[]>(
    "SELECT pn.id, pn.note, pn.created_at, a.fivem_username AS author_name "
      + "FROM player_notes pn "
      + "LEFT JOIN accounts a ON a.account_id = pn.author_account_id "
      + "WHERE pn.account_id = ? ORDER BY pn.created_at DESC",
    [accountId],
  );
  return rows as PlayerNoteRow[];
}

export async function addPlayerNote(accountId: number, authorAccountId: number, note: string): Promise<void> {
  await pool.query("INSERT INTO player_notes (account_id, author_account_id, note) VALUES (?, ?, ?)", [
    accountId,
    authorAccountId,
    note,
  ]);
}

// === Permission catalog + grants ============================================

export interface PermissionCatalogRow {
  permission: string;
  label: string;
}

export async function listPermissionCatalog(): Promise<PermissionCatalogRow[]> {
  const [rows] = await pool.query<mysql.RowDataPacket[]>("SELECT permission, label FROM permission_catalog ORDER BY permission");
  return rows as PermissionCatalogRow[];
}

export async function isValidCatalogPermission(permission: string): Promise<boolean> {
  const [rows] = await pool.query<mysql.RowDataPacket[]>(
    "SELECT 1 FROM permission_catalog WHERE permission = ? LIMIT 1",
    [permission],
  );
  return rows.length > 0;
}

export interface AccountPermissionRow {
  permission: string;
  source: "manual" | "discord";
}

export async function listPermissionsForAccount(accountId: number): Promise<AccountPermissionRow[]> {
  const [rows] = await pool.query<mysql.RowDataPacket[]>(
    "SELECT permission, source FROM permission_grants WHERE account_id = ? ORDER BY permission",
    [accountId],
  );
  return rows as AccountPermissionRow[];
}

// Sets a real granted_by (unlike services/discord-bot's grantManualPermission,
// which hardcodes NULL for its own automated-sync use case) - this is an
// explicit staff decision, same as sfos-core's own GrantPermission export
// the in-game admin menu calls. There's no live FXServer session to
// invalidate from here, so a grant only takes effect for an already-
// connected player on their next relog - there's no cross-process call from
// this Node service into a running FXServer to do better than that.
export async function grantPermission(accountId: number, permission: string, grantedBy: number): Promise<void> {
  await pool.query(
    "INSERT INTO permission_grants (account_id, permission, granted_by, source) VALUES (?, ?, ?, 'manual') "
      + "ON DUPLICATE KEY UPDATE granted_by = VALUES(granted_by), source = 'manual', granted_at = NOW()",
    [accountId, permission, grantedBy],
  );
}

export async function revokePermission(accountId: number, permission: string): Promise<void> {
  await pool.query("DELETE FROM permission_grants WHERE account_id = ? AND permission = ?", [accountId, permission]);
}

// === Staff roster (staff_members) ==========================================

export interface StaffRosterRow {
  account_id: number;
  title: string;
  notes: string | null;
  appointed_at: Date;
  fivem_username: string;
  appointed_by_name: string | null;
}

export async function listStaff(): Promise<StaffRosterRow[]> {
  const [rows] = await pool.query<mysql.RowDataPacket[]>(
    "SELECT sm.account_id, sm.title, sm.notes, sm.appointed_at, "
      + "a.fivem_username, appointer.fivem_username AS appointed_by_name "
      + "FROM staff_members sm "
      + "JOIN accounts a ON a.account_id = sm.account_id "
      + "LEFT JOIN accounts appointer ON appointer.account_id = sm.appointed_by "
      + "ORDER BY sm.appointed_at ASC",
  );
  return rows as StaffRosterRow[];
}

export async function appointStaff(
  accountId: number,
  title: string,
  notes: string | null,
  appointedBy: number,
): Promise<void> {
  await pool.query(
    "INSERT INTO staff_members (account_id, title, notes, appointed_by) VALUES (?, ?, ?, ?) "
      + "ON DUPLICATE KEY UPDATE title = VALUES(title), notes = VALUES(notes), "
      + "appointed_by = VALUES(appointed_by), appointed_at = NOW()",
    [accountId, title, notes, appointedBy],
  );
}

export async function updateStaff(accountId: number, title: string, notes: string | null): Promise<void> {
  await pool.query("UPDATE staff_members SET title = ?, notes = ? WHERE account_id = ?", [title, notes, accountId]);
}

export async function removeStaff(accountId: number): Promise<void> {
  await pool.query("DELETE FROM staff_members WHERE account_id = ?", [accountId]);
}

// Same cascade as sfos-admin's removeStaff handler: removing someone from
// the roster also revokes every sfos.staff.* permission they hold, since
// clicking "Remove" almost certainly means "this person shouldn't have
// staff access anymore." sfos.role.* permissions are untouched - being
// staff and holding an in-character department role are unrelated facts.
export async function revokeAllStaffPermissions(accountId: number): Promise<string[]> {
  const permissions = await listPermissionsForAccount(accountId);
  const staffPermissions = permissions.filter((row) => row.permission.startsWith("sfos.staff."));
  await Promise.all(staffPermissions.map((row) => revokePermission(accountId, row.permission)));
  return staffPermissions.map((row) => row.permission);
}

// === Recruitment application review queue (department_applications) =======

export interface ApplicationReviewRow {
  id: number;
  discord_identifier: string;
  discord_username: string;
  department: DepartmentCode;
  answers: Record<string, string>;
  status: ApplicationStatus;
  created_at: Date;
  reviewed_at: Date | null;
  reviewed_by_name: string | null;
}

export async function listApplications(status?: ApplicationStatus): Promise<ApplicationReviewRow[]> {
  const [rows] = await pool.query<mysql.RowDataPacket[]>(
    "SELECT da.id, da.discord_identifier, da.discord_username, da.department, da.answers, da.status, "
      + "da.created_at, da.reviewed_at, reviewer.fivem_username AS reviewed_by_name "
      + "FROM department_applications da "
      + "LEFT JOIN accounts reviewer ON reviewer.account_id = da.reviewed_by "
      + (status ? "WHERE da.status = ? " : "")
      + "ORDER BY da.created_at DESC",
    status ? [status] : [],
  );
  return rows.map((row) => ({
    ...row,
    answers: typeof row.answers === "string" ? JSON.parse(row.answers) : row.answers,
  })) as ApplicationReviewRow[];
}

export async function updateApplicationStatus(
  id: number,
  status: "accepted" | "rejected",
  reviewedBy: number,
): Promise<void> {
  await pool.query(
    "UPDATE department_applications SET status = ?, reviewed_by = ?, reviewed_at = NOW() WHERE id = ?",
    [status, reviewedBy, id],
  );
}
