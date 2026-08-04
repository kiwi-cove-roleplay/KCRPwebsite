import { NextResponse } from "next/server";
import { requireAdminActor } from "@/lib/requireAdmin";
import { listApplications } from "@/lib/adminApi";
import type { ApplicationStatus } from "@/lib/portalApi";

export async function GET(request: Request) {
  const actorAccountId = await requireAdminActor();
  if (actorAccountId === null) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }

  const status = new URL(request.url).searchParams.get("status") as ApplicationStatus | null;

  try {
    return NextResponse.json(await listApplications(actorAccountId, status ?? undefined));
  } catch (err) {
    console.error("[sfos-web] /api/admin/applications failed:", err);
    return NextResponse.json({ ok: false, error: "internal_error" }, { status: 502 });
  }
}
