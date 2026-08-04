import { NextResponse } from "next/server";
import { requireAdminActor } from "@/lib/requireAdmin";
import { removeStaff, updateStaff } from "@/lib/adminApi";

export async function PATCH(request: Request, { params }: { params: { accountId: string } }) {
  const actorAccountId = await requireAdminActor();
  if (actorAccountId === null) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }

  const accountId = Number(params.accountId);
  const body = await request.json().catch(() => null);
  const title = body && typeof body.title === "string" ? body.title : null;
  if (!Number.isInteger(accountId) || !title) {
    return NextResponse.json({ ok: false, error: "invalid_payload" }, { status: 400 });
  }

  try {
    const notes = typeof body.notes === "string" ? body.notes : null;
    return NextResponse.json(await updateStaff(actorAccountId, accountId, { title, notes }));
  } catch (err) {
    console.error("[sfos-web] /api/admin/staff/[accountId] PATCH failed:", err);
    return NextResponse.json({ ok: false, error: "internal_error" }, { status: 502 });
  }
}

export async function DELETE(_request: Request, { params }: { params: { accountId: string } }) {
  const actorAccountId = await requireAdminActor();
  if (actorAccountId === null) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }

  const accountId = Number(params.accountId);
  if (!Number.isInteger(accountId)) {
    return NextResponse.json({ ok: false, error: "invalid_payload" }, { status: 400 });
  }

  try {
    return NextResponse.json(await removeStaff(actorAccountId, accountId));
  } catch (err) {
    console.error("[sfos-web] /api/admin/staff/[accountId] DELETE failed:", err);
    return NextResponse.json({ ok: false, error: "internal_error" }, { status: 502 });
  }
}
