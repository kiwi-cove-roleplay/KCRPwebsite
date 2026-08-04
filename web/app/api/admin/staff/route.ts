import { NextResponse } from "next/server";
import { requireAdminActor } from "@/lib/requireAdmin";
import { appointStaff, listStaff } from "@/lib/adminApi";

export async function GET() {
  const actorAccountId = await requireAdminActor();
  if (actorAccountId === null) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }

  try {
    return NextResponse.json(await listStaff(actorAccountId));
  } catch (err) {
    console.error("[sfos-web] /api/admin/staff GET failed:", err);
    return NextResponse.json({ ok: false, error: "internal_error" }, { status: 502 });
  }
}

export async function POST(request: Request) {
  const actorAccountId = await requireAdminActor();
  if (actorAccountId === null) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const accountId = body && typeof body.accountId === "number" ? body.accountId : null;
  const title = body && typeof body.title === "string" ? body.title : null;
  if (accountId === null || !title) {
    return NextResponse.json({ ok: false, error: "invalid_payload" }, { status: 400 });
  }

  try {
    const notes = typeof body.notes === "string" ? body.notes : null;
    return NextResponse.json(await appointStaff(actorAccountId, { accountId, title, notes }));
  } catch (err) {
    console.error("[sfos-web] /api/admin/staff POST failed:", err);
    return NextResponse.json({ ok: false, error: "internal_error" }, { status: 502 });
  }
}
