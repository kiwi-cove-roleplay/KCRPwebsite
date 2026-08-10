import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { STAFF_ADMIN_PERMISSION } from "@/lib/permissions";

export { STAFF_ADMIN_PERMISSION } from "@/lib/permissions";

// Fast session-level gate so an unauthorized caller gets a 403 without a
// round trip to the portal API. Not the authoritative check - the portal
// API's /sfos/portal/admin/* routes re-derive sfos.staff.admin from the DB
// on every request regardless, since this session's permissions could be
// stale (see the SFRP_Core_2026 repo's http_router.lua RequireActorAdmin
// comment).
export async function requireAdminActor(): Promise<number | null> {
  const session = await getServerSession(authOptions);
  if (!session || session.accountId === null) {
    return null;
  }
  if (!session.permissions.includes(STAFF_ADMIN_PERMISSION)) {
    return null;
  }
  return session.accountId;
}
