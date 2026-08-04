import { NextResponse } from "next/server";
import { requireAdminActor } from "@/lib/requireAdmin";
import { revokePermission } from "@/lib/adminApi";

export async function DELETE(_request: Request, { params }: { params: { accountId: string; permission: string } }) {
  const actorAccountId = await requireAdminActor();
  if (actorAccountId === null) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }

  const accountId = Number(params.accountId);
  if (!Number.isInteger(accountId)) {
    return NextResponse.json({ ok: false, error: "invalid_payload" }, { status: 400 });
  }

  try {
    return NextResponse.json(await revokePermission(actorAccountId, accountId, decodeURIComponent(params.permission)));
  } catch (err) {
    console.error("[sfos-web] /api/admin/accounts/[accountId]/permissions/[permission] DELETE failed:", err);
    return NextResponse.json({ ok: false, error: "internal_error" }, { status: 502 });
  }
}
