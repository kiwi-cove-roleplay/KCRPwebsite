import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createApplication } from "@/lib/applications";
import type { DepartmentCode } from "@/lib/portalApi";

const VALID_DEPARTMENTS: DepartmentCode[] = ["NZP", "FENZ", "HHSJ"];

interface ApplicationRequestBody {
  department: DepartmentCode;
  answers: Record<string, string>;
}

function isValidBody(body: unknown): body is ApplicationRequestBody {
  if (typeof body !== "object" || body === null) {
    return false;
  }
  const candidate = body as Partial<ApplicationRequestBody>;
  return (
    typeof candidate.department === "string"
    && VALID_DEPARTMENTS.includes(candidate.department as DepartmentCode)
    && typeof candidate.answers === "object"
    && candidate.answers !== null
  );
}

// Only requires a signed-in website account, not a FiveM/portal-api link -
// see lib/applications.ts's top comment. A real game-account requirement
// can come back once that data has somewhere to reconcile to.
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ ok: false, error: "unauthenticated" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!isValidBody(body)) {
    return NextResponse.json({ ok: false, error: "invalid_payload" }, { status: 400 });
  }

  try {
    await createApplication(session.websiteUserId, body.department, body.answers);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[sfos-web] /api/applications failed:", err);
    return NextResponse.json({ ok: false, error: "internal_error" }, { status: 500 });
  }
}
