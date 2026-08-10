import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { requireAdminActor } from "@/lib/requireAdmin";
import { updateApplicationStatus } from "@/lib/applications";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const [actorAccountId, session] = await Promise.all([requireAdminActor(), getServerSession(authOptions)]);
  if (actorAccountId === null || !session) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const status = body?.status;
  if (!params.id || (status !== "accepted" && status !== "rejected")) {
    return NextResponse.json({ ok: false, error: "invalid_payload" }, { status: 400 });
  }

  try {
    return NextResponse.json(await updateApplicationStatus(params.id, status, session.websiteUserId));
  } catch (err) {
    console.error("[sfos-web] /api/admin/applications/[id] failed:", err);
    return NextResponse.json({ ok: false, error: "internal_error" }, { status: 502 });
  }
}
