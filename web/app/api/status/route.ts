import { NextResponse } from "next/server";
import { fetchStatus } from "@/lib/portalApi";

// Public - no session check. Proxies the portal API's equally-public GET
// /sfos/portal/status so the browser only ever talks to this app, never
// the portal API directly (see lib/portalApi.ts's fetchStatus comment).
//
// Forces this route to run per-request rather than be statically
// optimized - it already does a no-store fetch (fresh status every load),
// so without this Next throws a DynamicServerError trying to prerender it.
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const snapshot = await fetchStatus();
    return NextResponse.json(snapshot);
  } catch (err) {
    console.error("[sfos-web] /api/status failed:", err);
    return NextResponse.json({ data: null, updatedAt: null }, { status: 502 });
  }
}
