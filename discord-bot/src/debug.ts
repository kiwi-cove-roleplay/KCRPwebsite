import { config } from "./config.js";

// Silent no-op unless DEBUG=true (see .env.example) - config-only, restart
// to change, matching the Lua side's sfos_debug convention exactly.
export function debugLog(tag: string, ...args: unknown[]): void {
  if (!config.debug) {
    return;
  }
  console.log(`[DEBUG:${tag}]`, ...args);
}
