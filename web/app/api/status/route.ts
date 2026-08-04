import { NextResponse } from "next/server";
import { fetchStatus } from "@/lib/portalApi";

// Public - no session check. Proxies portal-api's equally-public GET
// /status so the browser only ever talks to this app, never portal-api
// directly (see lib/portalApi.ts's fetchStatus comment).
export async function GET() {
  try {
    const snapshot = await fetchStatus();
    return NextResponse.json(snapshot);
  } catch (err) {
    console.error("[sfos-web] /api/status failed:", err);
    return NextResponse.json({ data: null, updatedAt: null }, { status: 502 });
  }
}
