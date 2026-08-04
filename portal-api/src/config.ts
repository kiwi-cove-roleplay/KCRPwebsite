import "dotenv/config";

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

export const config = {
  debug: process.env.DEBUG === "true",
  db: {
    host: process.env.DB_HOST ?? "127.0.0.1",
    port: Number(process.env.DB_PORT ?? 3306),
    user: required("DB_USER"),
    password: process.env.DB_PASSWORD ?? "",
    database: required("DB_NAME"),
  },
  // Shared secret checked on every request except /health and the public
  // GET /status - the same server-to-server trust model as the main SFOS
  // repo's services/discord-bot's /log endpoint (see httpServer.ts's
  // x-sfos-log-secret check). Callers are always the web app's server-side
  // code, never a browser directly, so there's no CORS surface to worry
  // about here.
  portalApiSecret: required("PORTAL_API_SECRET"),
  port: Number(process.env.PORT ?? 30130),
};
