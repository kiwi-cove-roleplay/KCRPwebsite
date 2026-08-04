// Removes the sfos-portal-api Windows Service installed by
// install-service.js. Run once, elevated:
//   node portal-api/deploy/windows/uninstall-service.js
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import windows from "node-windows";

const { Service } = windows;

const __dirname = dirname(fileURLToPath(import.meta.url));
const apiDir = join(__dirname, "..", "..");

const svc = new Service({
  name: "sfos-portal-api",
  script: join(apiDir, "dist", "index.js"),
});

svc.on("uninstall", () => {
  console.log("sfos-portal-api service uninstalled.");
});

svc.uninstall();
