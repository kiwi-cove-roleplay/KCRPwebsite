import express from "express";
import { config } from "./config.js";
import {
  getAccountByDiscordId,
  getAllPermissions,
  getApplicationsForDiscordId,
  getCharactersForAccount,
  hasPermission,
  insertDepartmentApplication,
  isStaff,
  type ApplicationStatus,
  type DepartmentCode,
} from "./db.js";
import {
  addPlayerNote,
  appointStaff,
  banAccount,
  grantPermission,
  isValidCatalogPermission,
  listApplications,
  listBannedAccounts,
  listPermissionCatalog,
  listPermissionsForAccount,
  listPlayerNotes,
  listStaff,
  listStaffActions,
  logStaffAction,
  removeStaff,
  revokeAllStaffPermissions,
  revokePermission,
  searchAccounts,
  unbanAccount,
  updateApplicationStatus,
  updateStaff,
} from "./adminDb.js";
import { getStatusSnapshot, setStatusSnapshot } from "./statusStore.js";

const app = express();
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

// Public on purpose (design doc section 5) - this is the live on-duty
// status board's data source, polled by the website. Everything else stays
// behind the shared secret below.
app.get("/status", (_req, res) => {
  res.json(getStatusSnapshot() ?? { data: null, updatedAt: null });
});

// Every route below this point requires the shared secret - same
// server-to-server trust model as the main SFOS repo's
// services/discord-bot/httpServer.ts /log endpoint. Callers are the web
// app's server-side code, except /status/report, which is called directly
// by sfos-core (over the same shared-secret scheme, not a browser).
app.use((req, res, next) => {
  const providedSecret = req.header("x-sfos-portal-secret");
  if (providedSecret !== config.portalApiSecret) {
    res.status(401).json({ ok: false, error: "unauthorized" });
    return;
  }
  next();
});

interface ResolveAuthPayload {
  discordId: string;
}

app.post("/auth/resolve", async (req, res) => {
  const payload = req.body as Partial<ResolveAuthPayload>;
  if (typeof payload?.discordId !== "string" || payload.discordId.length === 0) {
    res.status(400).json({ ok: false, error: "invalid_payload" });
    return;
  }

  try {
    const account = await getAccountByDiscordId(payload.discordId);
    if (!account) {
      res.json({ accountId: null, permissions: [], isStaff: false, characters: [] });
      return;
    }

    const [permissions, staff, characters] = await Promise.all([
      getAllPermissions(account.account_id),
      isStaff(account.account_id),
      getCharactersForAccount(account.account_id),
    ]);

    res.json({ accountId: account.account_id, permissions, isStaff: staff, characters });
  } catch (err) {
    console.error("[sfos-portal-api] /auth/resolve failed:", err);
    res.status(500).json({ ok: false, error: "internal_error" });
  }
});

const VALID_DEPARTMENTS: DepartmentCode[] = ["NZP", "FENZ", "HHSJ"];

interface ApplicationPayload {
  discordId: string;
  discordUsername: string;
  department: DepartmentCode;
  answers: Record<string, string>;
}

function isValidApplicationPayload(payload: Partial<ApplicationPayload>): payload is ApplicationPayload {
  return (
    typeof payload.discordId === "string"
    && payload.discordId.length > 0
    && typeof payload.discordUsername === "string"
    && payload.discordUsername.length > 0
    && typeof payload.department === "string"
    && VALID_DEPARTMENTS.includes(payload.department as DepartmentCode)
    && typeof payload.answers === "object"
    && payload.answers !== null
  );
}

app.post("/applications", async (req, res) => {
  const payload = req.body as Partial<ApplicationPayload>;
  if (!isValidApplicationPayload(payload)) {
    res.status(400).json({ ok: false, error: "invalid_payload" });
    return;
  }

  try {
    const id = await insertDepartmentApplication(payload);
    res.json({ ok: true, id });
  } catch (err) {
    console.error("[sfos-portal-api] /applications failed:", err);
    res.status(500).json({ ok: false, error: "internal_error" });
  }
});

interface PortalSummaryPayload {
  accountId: number;
  discordId: string;
}

// Backs the player portal page (design doc Phase 3) - fetched fresh on
// every page load rather than reused from the session token, so a
// character created (or an application reviewed) after sign-in shows up
// without forcing a re-login. accountId/discordId come from the caller's
// own session server-side, not attacker-controllable input, so this is
// only ever a read of the signed-in user's own data - not an
// authorization decision the way Phase 4's admin actions will be.
app.post("/portal/summary", async (req, res) => {
  const payload = req.body as Partial<PortalSummaryPayload>;
  if (typeof payload?.accountId !== "number" || typeof payload?.discordId !== "string") {
    res.status(400).json({ ok: false, error: "invalid_payload" });
    return;
  }

  try {
    const [characters, applications] = await Promise.all([
      getCharactersForAccount(payload.accountId),
      getApplicationsForDiscordId(payload.discordId),
    ]);
    res.json({ characters, applications });
  } catch (err) {
    console.error("[sfos-portal-api] /portal/summary failed:", err);
    res.status(500).json({ ok: false, error: "internal_error" });
  }
});

// Pushed by sfos-core's status_push.lua roughly every 60s (design doc
// section 5). Payload shape is whatever GetOnDutyCounts() returns on the
// Lua side - stored and echoed back as-is rather than validated field by
// field, since portal-api has no independent way to know that shape.
app.post("/status/report", (req, res) => {
  setStatusSnapshot(req.body);
  res.json({ ok: true });
});

const STAFF_ADMIN_PERMISSION = "sfos.staff.admin";

// Every /admin/* route needs BOTH the shared secret (already checked above)
// AND the acting account currently holding sfos.staff.admin - re-derived
// from the DB on every request, never trusted from a session token, since
// a permission could have been revoked since that token was issued. Mirrors
// the main SFOS repo's sfos-admin RequireAdmin check exactly (minus its ACE-
// group bootstrap fallback, which only makes sense for an in-game admin
// with no accounts row yet). actorAccountId itself is expected to come from
// the web app's own session-derived value, never client-submitted input -
// see web's lib/adminApi.ts.
const adminRouter = express.Router();

adminRouter.use(async (req, res, next) => {
  const actorAccountId = Number(req.header("x-sfos-actor-account-id"));
  if (!Number.isInteger(actorAccountId)) {
    res.status(400).json({ ok: false, error: "missing_actor" });
    return;
  }

  try {
    if (!(await hasPermission(actorAccountId, STAFF_ADMIN_PERMISSION))) {
      res.status(403).json({ ok: false, error: "forbidden" });
      return;
    }
  } catch (err) {
    console.error("[sfos-portal-api] admin auth check failed:", err);
    res.status(500).json({ ok: false, error: "internal_error" });
    return;
  }

  res.locals.actorAccountId = actorAccountId;
  next();
});

adminRouter.get("/accounts/search", async (req, res) => {
  const query = typeof req.query.q === "string" ? req.query.q : "";
  if (query.length === 0) {
    res.json([]);
    return;
  }
  res.json(await searchAccounts(query));
});

adminRouter.get("/bans", async (_req, res) => {
  res.json(await listBannedAccounts());
});

interface BanPayload {
  accountId: number;
  reason: string;
  expiresAt: string | null;
}

adminRouter.post("/bans", async (req, res) => {
  const payload = req.body as Partial<BanPayload>;
  if (typeof payload?.accountId !== "number" || typeof payload.reason !== "string" || payload.reason.length === 0) {
    res.status(400).json({ ok: false, error: "invalid_payload" });
    return;
  }

  const actorAccountId = res.locals.actorAccountId as number;
  await banAccount(payload.accountId, payload.reason, actorAccountId, payload.expiresAt ?? null);
  await logStaffAction(actorAccountId, "player_banned", "account", String(payload.accountId), payload.reason);
  res.json({ ok: true });
});

adminRouter.post("/bans/:accountId/unban", async (req, res) => {
  const accountId = Number(req.params.accountId);
  if (!Number.isInteger(accountId)) {
    res.status(400).json({ ok: false, error: "invalid_payload" });
    return;
  }

  const actorAccountId = res.locals.actorAccountId as number;
  await unbanAccount(accountId);
  await logStaffAction(actorAccountId, "player_unbanned", "account", String(accountId), null);
  res.json({ ok: true });
});

adminRouter.get("/accounts/:accountId/notes", async (req, res) => {
  const accountId = Number(req.params.accountId);
  if (!Number.isInteger(accountId)) {
    res.status(400).json({ ok: false, error: "invalid_payload" });
    return;
  }
  res.json(await listPlayerNotes(accountId));
});

adminRouter.post("/accounts/:accountId/notes", async (req, res) => {
  const accountId = Number(req.params.accountId);
  const note = (req.body as { note?: unknown }).note;
  if (!Number.isInteger(accountId) || typeof note !== "string" || note.length === 0) {
    res.status(400).json({ ok: false, error: "invalid_payload" });
    return;
  }

  const actorAccountId = res.locals.actorAccountId as number;
  await addPlayerNote(accountId, actorAccountId, note);
  await logStaffAction(actorAccountId, "player_note_added", "account", String(accountId), note);
  res.json(await listPlayerNotes(accountId));
});

adminRouter.get("/permission-catalog", async (_req, res) => {
  res.json(await listPermissionCatalog());
});

adminRouter.get("/accounts/:accountId/permissions", async (req, res) => {
  const accountId = Number(req.params.accountId);
  if (!Number.isInteger(accountId)) {
    res.status(400).json({ ok: false, error: "invalid_payload" });
    return;
  }
  res.json(await listPermissionsForAccount(accountId));
});

adminRouter.post("/accounts/:accountId/permissions", async (req, res) => {
  const accountId = Number(req.params.accountId);
  const permission = (req.body as { permission?: unknown }).permission;
  if (!Number.isInteger(accountId) || typeof permission !== "string") {
    res.status(400).json({ ok: false, error: "invalid_payload" });
    return;
  }
  if (!(await isValidCatalogPermission(permission))) {
    res.status(400).json({ ok: false, error: "invalid_permission" });
    return;
  }

  const actorAccountId = res.locals.actorAccountId as number;
  await grantPermission(accountId, permission, actorAccountId);
  await logStaffAction(actorAccountId, "permission_granted", "account", String(accountId), permission);
  res.json(await listPermissionsForAccount(accountId));
});

adminRouter.delete("/accounts/:accountId/permissions/:permission", async (req, res) => {
  const accountId = Number(req.params.accountId);
  const permission = req.params.permission;
  if (!Number.isInteger(accountId)) {
    res.status(400).json({ ok: false, error: "invalid_payload" });
    return;
  }

  const actorAccountId = res.locals.actorAccountId as number;
  await revokePermission(accountId, permission);
  await logStaffAction(actorAccountId, "permission_revoked", "account", String(accountId), permission);
  res.json(await listPermissionsForAccount(accountId));
});

adminRouter.get("/staff", async (_req, res) => {
  res.json(await listStaff());
});

interface AppointStaffPayload {
  accountId: number;
  title: string;
  notes: string | null;
}

adminRouter.post("/staff", async (req, res) => {
  const payload = req.body as Partial<AppointStaffPayload>;
  if (typeof payload?.accountId !== "number" || typeof payload.title !== "string" || payload.title.length === 0) {
    res.status(400).json({ ok: false, error: "invalid_payload" });
    return;
  }

  const actorAccountId = res.locals.actorAccountId as number;
  await appointStaff(payload.accountId, payload.title, payload.notes ?? null, actorAccountId);
  await logStaffAction(actorAccountId, "staff_appointed", "account", String(payload.accountId), payload.title);
  res.json(await listStaff());
});

adminRouter.patch("/staff/:accountId", async (req, res) => {
  const accountId = Number(req.params.accountId);
  const payload = req.body as { title?: unknown; notes?: unknown };
  if (!Number.isInteger(accountId) || typeof payload.title !== "string" || payload.title.length === 0) {
    res.status(400).json({ ok: false, error: "invalid_payload" });
    return;
  }

  const actorAccountId = res.locals.actorAccountId as number;
  const notes = typeof payload.notes === "string" ? payload.notes : null;
  await updateStaff(accountId, payload.title, notes);
  await logStaffAction(actorAccountId, "staff_updated", "account", String(accountId), payload.title);
  res.json(await listStaff());
});

adminRouter.delete("/staff/:accountId", async (req, res) => {
  const accountId = Number(req.params.accountId);
  if (!Number.isInteger(accountId)) {
    res.status(400).json({ ok: false, error: "invalid_payload" });
    return;
  }

  const actorAccountId = res.locals.actorAccountId as number;
  await removeStaff(accountId);
  const revoked = await revokeAllStaffPermissions(accountId);
  const details = revoked.length > 0 ? `also revoked: ${revoked.join(", ")}` : null;
  await logStaffAction(actorAccountId, "staff_removed", "account", String(accountId), details);
  res.json(await listStaff());
});

adminRouter.get("/staff-actions", async (_req, res) => {
  res.json(await listStaffActions());
});

adminRouter.get("/applications", async (req, res) => {
  const status = typeof req.query.status === "string" ? (req.query.status as ApplicationStatus) : undefined;
  res.json(await listApplications(status));
});

adminRouter.post("/applications/:id", async (req, res) => {
  const id = Number(req.params.id);
  const status = (req.body as { status?: unknown }).status;
  if (!Number.isInteger(id) || (status !== "accepted" && status !== "rejected")) {
    res.status(400).json({ ok: false, error: "invalid_payload" });
    return;
  }

  const actorAccountId = res.locals.actorAccountId as number;
  await updateApplicationStatus(id, status, actorAccountId);
  await logStaffAction(actorAccountId, `application_${status}`, "application", String(id), null);
  res.json(await listApplications());
});

app.use("/admin", adminRouter);

app.listen(config.port, () => {
  console.log(`[sfos-portal-api] listening on port ${config.port}`);
});
