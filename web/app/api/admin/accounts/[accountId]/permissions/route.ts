import { NextResponse } from "next/server";
import { requireAdminActor } from "@/lib/requireAdmin";
import { grantPermission, listAccountPermissions } from "@/lib/adminApi";

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
    return NextResponse.json(await listAccountPermissions(actorAccountId, accountId));
  } catch (err) {
    console.error("[sfos-web] /api/admin/accounts/[accountId]/permissions GET failed:", err);
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
  const permission = body && typeof body.permission === "string" ? body.permission : null;
  if (!Number.isInteger(accountId) || !permission) {
    return NextResponse.json({ ok: false, error: "invalid_payload" }, { status: 400 });
  }

  try {
    return NextResponse.json(await grantPermission(actorAccountId, accountId, permission));
  } catch (err) {
    console.error("[sfos-web] /api/admin/accounts/[accountId]/permissions POST failed:", err);
    return NextResponse.json({ ok: false, error: "internal_error" }, { status: 502 });
  }
}
