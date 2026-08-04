import express from "express";
import { config } from "./config.js";
import { getAccountByDiscordId, getAllPermissions, getCharactersForAccount, isStaff } from "./db.js";

const app = express();
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

// Every route below this point requires the shared secret - same
// server-to-server trust model as the main SFOS repo's
// services/discord-bot/httpServer.ts /log endpoint. Callers are always the
// web app's server-side code.
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

app.listen(config.port, () => {
  console.log(`[sfos-portal-api] listening on port ${config.port}`);
});
