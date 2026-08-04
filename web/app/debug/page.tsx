import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { AuthButton } from "@/components/AuthButton";
import { Card } from "@/components/ui/Card";

// Not linked from nav - kept from Phase 1 to verify the Discord login ->
// portal-api /auth/resolve -> session chain still works end-to-end.
export default async function DebugPage() {
  const session = await getServerSession(authOptions);

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <h1 className="text-2xl text-bone">Debug: session</h1>
      <AuthButton signedIn={Boolean(session)} />
      {session && (
        <Card>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <dt className="text-muted">Discord</dt>
            <dd className="text-bone">{session.user?.name ?? "unknown"}</dd>
            <dt className="text-muted">Account ID</dt>
            <dd className="text-bone">{session.accountId ?? "not linked - join the server first"}</dd>
            <dt className="text-muted">Staff</dt>
            <dd className="text-bone">{session.isStaff ? "yes" : "no"}</dd>
            <dt className="text-muted">Permissions</dt>
            <dd className="text-bone">{session.permissions.length > 0 ? session.permissions.join(", ") : "none"}</dd>
          </dl>
        </Card>
      )}
    </div>
  );
}
