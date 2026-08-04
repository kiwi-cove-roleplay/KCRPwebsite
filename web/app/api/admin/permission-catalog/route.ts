import { NextResponse } from "next/server";
import { requireAdminActor } from "@/lib/requireAdmin";
import { listPermissionCatalog } from "@/lib/adminApi";

export async function GET() {
  const actorAccountId = await requireAdminActor();
  if (actorAccountId === null) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }

  try {
    return NextResponse.json(await listPermissionCatalog(actorAccountId));
  } catch (err) {
    console.error("[sfos-web] /api/admin/permission-catalog failed:", err);
    return NextResponse.json({ ok: false, error: "internal_error" }, { status: 502 });
  }
}
