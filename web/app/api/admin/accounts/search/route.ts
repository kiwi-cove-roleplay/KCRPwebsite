import { NextResponse } from "next/server";
import { requireAdminActor } from "@/lib/requireAdmin";
import { searchAccounts } from "@/lib/adminApi";

export async function GET(request: Request) {
  const actorAccountId = await requireAdminActor();
  if (actorAccountId === null) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }

  const query = new URL(request.url).searchParams.get("q") ?? "";
  try {
    return NextResponse.json(await searchAccounts(actorAccountId, query));
  } catch (err) {
    console.error("[sfos-web] /api/admin/accounts/search failed:", err);
    return NextResponse.json({ ok: false, error: "internal_error" }, { status: 502 });
  }
}
