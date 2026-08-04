import { NextResponse } from "next/server";
import { requireAdminActor } from "@/lib/requireAdmin";
import { updateApplicationStatus } from "@/lib/adminApi";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const actorAccountId = await requireAdminActor();
  if (actorAccountId === null) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }

  const id = Number(params.id);
  const body = await request.json().catch(() => null);
  const status = body?.status;
  if (!Number.isInteger(id) || (status !== "accepted" && status !== "rejected")) {
    return NextResponse.json({ ok: false, error: "invalid_payload" }, { status: 400 });
  }

  try {
    return NextResponse.json(await updateApplicationStatus(actorAccountId, id, status));
  } catch (err) {
    console.error("[sfos-web] /api/admin/applications/[id] failed:", err);
    return NextResponse.json({ ok: false, error: "internal_error" }, { status: 502 });
  }
}
