import express from "express";
import { config } from "./config.js";
import {
  getAccountByDiscordId,
  getAllPermissions,
  getApplicationsForDiscordId,
  getCharactersForAccount,
  insertDepartmentApplication,
  isStaff,
  type DepartmentCode,
} from "./db.js";
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

app.listen(config.port, () => {
  console.log(`[sfos-portal-api] listening on port ${config.port}`);
});
