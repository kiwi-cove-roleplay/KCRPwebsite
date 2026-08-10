// Human-facing landing page for GET / — what someone sees when they open
// https://api.kcrp.nz/ in a browser. Deliberately public and content-free of
// anything sensitive: it names the service, confirms it's up, and lists the
// public endpoints. Everything else stays behind the shared secret and is
// only described, never exposed.

export interface ServiceInfo {
  service: string;
  // "online" when the game database is reachable, "degraded" when the process
  // is up but can't reach MySQL.
  status: string;
  version: string;
  uptimeSeconds: number;
  time: string;
  // Whether this service can currently reach the game MySQL database, and if
  // not, the error category (e.g. "ECONNREFUSED", "ER_ACCESS_DENIED",
  // "ER_BAD_DB_ERROR") - the code only, never the full host:port detail.
  database: {
    connected: boolean;
    reason?: string;
  };
  liveStatus: {
    available: boolean;
    updatedAt: string | null;
  };
  endpoints: {
    public: string[];
    authenticated: string;
  };
}

function formatUptime(totalSeconds: number): string {
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  parts.push(`${seconds}s`);
  return parts.join(" ");
}

// Escape the small amount of dynamic text we interpolate. None of it is
// user-supplied today, but the endpoint names / timestamps go through here so
// this page can never become an injection vector if that ever changes.
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function renderLandingPage(info: ServiceInfo): string {
  const liveLine = info.liveStatus.available
    ? `Live on-duty status is available (last updated ${escapeHtml(info.liveStatus.updatedAt ?? "unknown")}).`
    : "No live on-duty status has been reported yet.";

  // Badge reflects overall reachability: green when the game DB is up, amber
  // "Degraded" when the process is running but MySQL is unreachable.
  const online = info.database.connected;
  const badgeClass = online ? "badge badge-ok" : "badge badge-warn";
  const badgeLabel = online ? "Online" : "Degraded";
  const dbStatus = online
    ? `<span class="ok">Connected</span>`
    : `<span class="warn">Unreachable${info.database.reason ? ` (${escapeHtml(info.database.reason)})` : ""}</span>`;

  const publicRows = info.endpoints.public
    .map((endpoint) => `<li><code>${escapeHtml(endpoint)}</code></li>`)
    .join("");

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="robots" content="noindex" />
<title>${escapeHtml(info.service)}</title>
<style>
  :root { color-scheme: dark; }
  * { box-sizing: border-box; }
  body {
    margin: 0; min-height: 100vh;
    display: flex; align-items: center; justify-content: center;
    background: #0f1216; color: #e7e2d6;
    font: 15px/1.6 ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
    padding: 24px;
  }
  main {
    width: 100%; max-width: 560px;
    background: #171b21; border: 1px solid #262c34; border-radius: 14px;
    padding: 28px 30px;
  }
  h1 { margin: 0 0 2px; font-size: 20px; letter-spacing: .2px; }
  .sub { margin: 0 0 20px; color: #8b98a5; font-size: 13px; }
  .badge {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 5px 12px; border-radius: 999px; font-size: 13px; font-weight: 600;
  }
  .badge-ok { background: rgba(63,178,127,.12); color: #6fd3a3; border: 1px solid rgba(63,178,127,.35); }
  .badge-ok .dot { background: #3fb27f; }
  .badge-warn { background: rgba(219,161,58,.12); color: #e6b95c; border: 1px solid rgba(219,161,58,.35); }
  .badge-warn .dot { background: #dba13a; }
  .dot { width: 8px; height: 8px; border-radius: 50%; animation: pulse 2s infinite; }
  @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: .35; } }
  .ok { color: #6fd3a3; font-weight: 600; }
  .warn { color: #e0554a; font-weight: 600; }
  dl { display: grid; grid-template-columns: auto 1fr; gap: 6px 16px; margin: 20px 0; font-size: 14px; }
  dt { color: #8b98a5; }
  dd { margin: 0; }
  .live { margin: 16px 0; padding: 12px 14px; background: #0f1216; border-radius: 10px; font-size: 13px; color: #b9c2cc; }
  h2 { font-size: 12px; text-transform: uppercase; letter-spacing: .8px; color: #8b98a5; margin: 22px 0 8px; }
  ul { margin: 0; padding-left: 18px; }
  li { margin: 3px 0; }
  code { background: #0f1216; border: 1px solid #262c34; border-radius: 6px; padding: 1px 6px; font-size: 13px; color: #cdd6e0; }
  .note { color: #8b98a5; font-size: 13px; margin-top: 6px; }
  footer { margin-top: 22px; color: #5c6672; font-size: 12px; }
</style>
</head>
<body>
<main>
  <span class="${badgeClass}"><span class="dot"></span>${badgeLabel}</span>
  <h1>${escapeHtml(info.service)}</h1>
  <p class="sub">Kiwi Cove Roleplay — game database API</p>

  <dl>
    <dt>Game database</dt><dd>${dbStatus}</dd>
    <dt>Version</dt><dd>${escapeHtml(info.version)}</dd>
    <dt>Uptime</dt><dd>${escapeHtml(formatUptime(info.uptimeSeconds))}</dd>
    <dt>Server time</dt><dd>${escapeHtml(info.time)}</dd>
  </dl>

  <div class="live">${liveLine}</div>

  <h2>Public endpoints</h2>
  <ul>${publicRows}</ul>
  <p class="note">${escapeHtml(info.endpoints.authenticated)}</p>

  <footer>This is a backend API, not a website. Visit the community site instead.</footer>
</main>
</body>
</html>`;
}
