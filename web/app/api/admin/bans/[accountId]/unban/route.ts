import { NextResponse } from "next/server";
import { requireAdminActor } from "@/lib/requireAdmin";
import { unbanAccount } from "@/lib/adminApi";

export async function POST(_request: Request, { params }: { params: { accountId: string } }) {
  const actorAccountId = await requireAdminActor();
  if (actorAccountId === null) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }

  const accountId = Number(params.accountId);
  if (!Number.isInteger(accountId)) {
    return NextResponse.json({ ok: false, error: "invalid_payload" }, { status: 400 });
  }

  try {
    await unbanAccount(actorAccountId, accountId);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[sfos-web] /api/admin/bans/[accountId]/unban failed:", err);
    return NextResponse.json({ ok: false, error: "internal_error" }, { status: 502 });
  }
}
