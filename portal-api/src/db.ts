import mysql from "mysql2/promise";
import { config } from "./config.js";

// Same MySQL database sfos-core/oxmysql and the main SFOS repo's
// services/discord-bot read from. This service is read-only against it for
// now (Phase 1 only exposes /auth/resolve) - see that repo's
// services/discord-bot/src/db.ts for the queries these are deliberately
// mirroring rather than importing (separate repos, so no shared TS package
// for ~4 queries).
export const pool = mysql.createPool({
  host: config.db.host,
  port: config.db.port,
  user: config.db.user,
  password: config.db.password,
  database: config.db.database,
  waitForConnections: true,
  connectionLimit: 5,
});

export interface AccountSummary {
  account_id: number;
  fivem_username: string;
}

export async function getAccountByDiscordId(discordId: string): Promise<AccountSummary | null> {
  const [rows] = await pool.query<mysql.RowDataPacket[]>(
    "SELECT account_id, fivem_username FROM accounts WHERE discord_identifier = ? LIMIT 1",
    [discordId],
  );
  return rows.length > 0 ? (rows[0] as AccountSummary) : null;
}

export async function getAllPermissions(accountId: number): Promise<string[]> {
  const [rows] = await pool.query<mysql.RowDataPacket[]>(
    "SELECT permission FROM permission_grants WHERE account_id = ? ORDER BY permission",
    [accountId],
  );
  return rows.map((row) => row.permission as string);
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

// staff_members is the server staff roster (see database/migrations/
// 0027_staff_members.sql) - membership here, not any specific permission
// string, is what "is staff" means for portal purposes.
export async function isStaff(accountId: number): Promise<boolean> {
  const [rows] = await pool.query<mysql.RowDataPacket[]>(
    "SELECT 1 FROM staff_members WHERE account_id = ? LIMIT 1",
    [accountId],
  );
  return rows.length > 0;
}

export type DepartmentCode = "NZP" | "FENZ" | "HHSJ";

export interface DepartmentApplicationInput {
  discordId: string;
  discordUsername: string;
  department: DepartmentCode;
  answers: Record<string, string>;
}

// department_applications - see database/migrations/
// 0034_department_applications.sql in the main SFOS repo. Stores
// discord_identifier/discord_username directly rather than an account_id
// FK because an applicant only needs to be signed in with Discord, not to
// have ever connected to the FiveM server.
export async function insertDepartmentApplication(input: DepartmentApplicationInput): Promise<number> {
  const [result] = await pool.query<mysql.ResultSetHeader>(
    "INSERT INTO department_applications (discord_identifier, discord_username, department, answers) "
      + "VALUES (?, ?, ?, ?)",
    [input.discordId, input.discordUsername, input.department, JSON.stringify(input.answers)],
  );
  return result.insertId;
}

export type ApplicationStatus = "pending" | "accepted" | "rejected";

export interface ApplicationSummary {
  id: number;
  department: DepartmentCode;
  status: ApplicationStatus;
  created_at: Date;
  reviewed_at: Date | null;
}

// Keyed on discord_identifier, not account_id - matches how rows are
// written (see insertDepartmentApplication above), and lets someone see
// their own application history even from before they had an accounts row.
export async function getApplicationsForDiscordId(discordId: string): Promise<ApplicationSummary[]> {
  const [rows] = await pool.query<mysql.RowDataPacket[]>(
    "SELECT id, department, status, created_at, reviewed_at FROM department_applications "
      + "WHERE discord_identifier = ? ORDER BY created_at DESC",
    [discordId],
  );
  return rows as ApplicationSummary[];
}
