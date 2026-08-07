import { appendFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

// Separate from console output because node-windows' stdout capture isn't
// straightforward to locate on the box running the service - this gives a
// fixed, known file to tail instead of hunting for it.
const logDir = join(process.cwd(), "logs");
mkdirSync(logDir, { recursive: true });
const logFile = join(logDir, "portal-api.log");

export function logError(context: string, err: unknown): void {
  console.error(`[sfos-portal-api] ${context}:`, err);
  const detail = err instanceof Error ? (err.stack ?? err.message) : String(err);
  appendFileSync(logFile, `${new Date().toISOString()} [${context}] ${detail}\n`);
}
