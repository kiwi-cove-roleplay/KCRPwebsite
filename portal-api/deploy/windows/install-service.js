// Installs portal-api as a Windows Service using node-windows, so it
// restarts on crash and starts automatically on reboot - the Windows
// Server equivalent of ../install.sh's systemd unit for a Linux VPS.
//
// node-windows is a devDependency used only by this script - never
// imported by src/index.ts itself, since requiring it throws immediately
// on any non-Windows platform (see its own source), which would otherwise
// break running portal-api anywhere else.
//
// Run once, from an elevated (Administrator) PowerShell or cmd, after
// `pnpm install` and `pnpm --filter sfos-portal-api build`:
//   node portal-api/deploy/windows/install-service.js
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import windows from "node-windows";

const { Service } = windows;

const __dirname = dirname(fileURLToPath(import.meta.url));
const apiDir = join(__dirname, "..", "..");

const svc = new Service({
  name: "sfos-portal-api",
  description: "Southern Frontier OS Portal API",
  script: join(apiDir, "dist", "index.js"),
  workingDirectory: apiDir,
  // dist/index.js loads its own .env via dotenv/config (see src/config.ts)
  // as long as workingDirectory is set correctly above - no env vars need
  // passing through here.
});

svc.on("install", () => {
  console.log("sfos-portal-api service installed. Starting...");
  svc.start();
});

svc.on("alreadyinstalled", () => {
  console.log("sfos-portal-api service is already installed.");
});

svc.on("start", () => {
  console.log("sfos-portal-api service started.");
  console.log("Manage it from services.msc, or: net start/stop sfos-portal-api");
});

svc.on("error", (err) => {
  console.error("Service install failed:", err);
});

svc.install();
