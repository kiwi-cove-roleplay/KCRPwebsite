// Thin server-side client for the portal API's /sfos/portal/admin/* routes
// (served by FXServer itself - see resources/[core]/sfos-core/server/
// http_router.lua in the SFRP_Core_2026 repo). Only ever called from web's
// own /api/admin/* route handlers, which derive actorAccountId from the
// caller's own session (session.accountId) - never from client-submitted
// input, since the router trusts whatever account id arrives in
// x-sfos-actor-account-id to re-derive that account's current
// sfos.staff.admin permission. If a browser could set that header directly,
// it could claim to be any account; routing everything through this
// server-only module (never imported from a "use client" component) is
// what prevents that.
import type { ApplicationStatus, DepartmentCode } from "@/lib/portalApi";

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

async function adminFetch<T>(actorAccountId: number, path: string, init: RequestInit = {}): Promise<T> {
  const baseUrl = requiredEnv("PORTAL_API_URL");
  const secret = requiredEnv("PORTAL_API_SECRET");

  const res = await fetch(`${baseUrl}/sfos/portal/admin${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      "x-sfos-portal-secret": secret,
      "x-sfos-actor-account-id": String(actorAccountId),
      ...init.headers,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`portal API /sfos/portal/admin${path} failed: ${res.status}`);
  }

  return (await res.json()) as T;
}

export interface AccountSearchResult {
  account_id: number;
  fivem_username: string;
  discord_identifier: string | null;
  is_banned: boolean;
}

export function searchAccounts(actorAccountId: number, query: string): Promise<AccountSearchResult[]> {
  return adminFetch(actorAccountId, `/accounts/search?q=${encodeURIComponent(query)}`);
}

export interface BannedAccountRow {
  account_id: number;
  fivem_username: string;
  ban_reason: string | null;
  banned_at: string;
  ban_expires_at: string | null;
  banned_by_name: string | null;
}

export function listBans(actorAccountId: number): Promise<BannedAccountRow[]> {
  return adminFetch(actorAccountId, "/bans");
}

export function banAccount(
  actorAccountId: number,
  input: { accountId: number; reason: string; expiresAt: string | null },
): Promise<void> {
  return adminFetch(actorAccountId, "/bans", { method: "POST", body: JSON.stringify(input) });
}

export function unbanAccount(actorAccountId: number, accountId: number): Promise<void> {
  return adminFetch(actorAccountId, `/bans/${accountId}/unban`, { method: "POST" });
}

export interface PlayerNoteRow {
  id: number;
  note: string;
  created_at: string;
  author_name: string | null;
}

export function listPlayerNotes(actorAccountId: number, accountId: number): Promise<PlayerNoteRow[]> {
  return adminFetch(actorAccountId, `/accounts/${accountId}/notes`);
}

export function addPlayerNote(actorAccountId: number, accountId: number, note: string): Promise<PlayerNoteRow[]> {
  return adminFetch(actorAccountId, `/accounts/${accountId}/notes`, { method: "POST", body: JSON.stringify({ note }) });
}

export interface PermissionCatalogRow {
  permission: string;
  label: string;
}

export function listPermissionCatalog(actorAccountId: number): Promise<PermissionCatalogRow[]> {
  return adminFetch(actorAccountId, "/permission-catalog");
}

export interface AccountPermissionRow {
  permission: string;
  source: "manual" | "discord";
}

export function listAccountPermissions(actorAccountId: number, accountId: number): Promise<AccountPermissionRow[]> {
  return adminFetch(actorAccountId, `/accounts/${accountId}/permissions`);
}

export function grantPermission(
  actorAccountId: number,
  accountId: number,
  permission: string,
): Promise<AccountPermissionRow[]> {
  return adminFetch(actorAccountId, `/accounts/${accountId}/permissions`, {
    method: "POST",
    body: JSON.stringify({ permission }),
  });
}

export function revokePermission(
  actorAccountId: number,
  accountId: number,
  permission: string,
): Promise<AccountPermissionRow[]> {
  return adminFetch(actorAccountId, `/accounts/${accountId}/permissions/${encodeURIComponent(permission)}`, {
    method: "DELETE",
  });
}

export interface StaffRosterRow {
  account_id: number;
  title: string;
  notes: string | null;
  appointed_at: string;
  fivem_username: string;
  appointed_by_name: string | null;
}

export function listStaff(actorAccountId: number): Promise<StaffRosterRow[]> {
  return adminFetch(actorAccountId, "/staff");
}

export function appointStaff(
  actorAccountId: number,
  input: { accountId: number; title: string; notes: string | null },
): Promise<StaffRosterRow[]> {
  return adminFetch(actorAccountId, "/staff", { method: "POST", body: JSON.stringify(input) });
}

export function updateStaff(
  actorAccountId: number,
  accountId: number,
  input: { title: string; notes: string | null },
): Promise<StaffRosterRow[]> {
  return adminFetch(actorAccountId, `/staff/${accountId}`, { method: "PATCH", body: JSON.stringify(input) });
}

export function removeStaff(actorAccountId: number, accountId: number): Promise<StaffRosterRow[]> {
  return adminFetch(actorAccountId, `/staff/${accountId}`, { method: "DELETE" });
}

export interface StaffActionRow {
  id: number;
  action: string;
  target_type: string | null;
  target_id: string | null;
  details: string | null;
  created_at: string;
  actor_name: string | null;
}

export function listStaffActions(actorAccountId: number): Promise<StaffActionRow[]> {
  return adminFetch(actorAccountId, "/staff-actions");
}

export interface ApplicationReviewRow {
  id: number;
  discord_identifier: string;
  discord_username: string;
  department: DepartmentCode;
  answers: Record<string, string>;
  status: ApplicationStatus;
  created_at: string;
  reviewed_at: string | null;
  reviewed_by_name: string | null;
}

export function listApplications(actorAccountId: number, status?: ApplicationStatus): Promise<ApplicationReviewRow[]> {
  return adminFetch(actorAccountId, status ? `/applications?status=${status}` : "/applications");
}

export function updateApplicationStatus(
  actorAccountId: number,
  id: number,
  status: "accepted" | "rejected",
): Promise<ApplicationReviewRow[]> {
  return adminFetch(actorAccountId, `/applications/${id}`, { method: "POST", body: JSON.stringify({ status }) });
}
