import { NextResponse } from "next/server";
import { requireAdminActor } from "@/lib/requireAdmin";
import { addPlayerNote, listPlayerNotes } from "@/lib/adminApi";

export async function GET(_request: Request, { params }: { params: { accountId: string } }) {
  const actorAccountId = await requireAdminActor();
  if (actorAccountId === null) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }

  const accountId = Number(params.accountId);
  if (!Number.isInteger(accountId)) {
    return NextResponse.json({ ok: false, error: "invalid_payload" }, { status: 400 });
  }

  try {
    return NextResponse.json(await listPlayerNotes(actorAccountId, accountId));
  } catch (err) {
    console.error("[sfos-web] /api/admin/accounts/[accountId]/notes GET failed:", err);
    return NextResponse.json({ ok: false, error: "internal_error" }, { status: 502 });
  }
}

export async function POST(request: Request, { params }: { params: { accountId: string } }) {
  const actorAccountId = await requireAdminActor();
  if (actorAccountId === null) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }

  const accountId = Number(params.accountId);
  const body = await request.json().catch(() => null);
  const note = body && typeof body.note === "string" ? body.note : null;
  if (!Number.isInteger(accountId) || !note) {
    return NextResponse.json({ ok: false, error: "invalid_payload" }, { status: 400 });
  }

  try {
    return NextResponse.json(await addPlayerNote(actorAccountId, accountId, note));
  } catch (err) {
    console.error("[sfos-web] /api/admin/accounts/[accountId]/notes POST failed:", err);
    return NextResponse.json({ ok: false, error: "internal_error" }, { status: 502 });
  }
}
