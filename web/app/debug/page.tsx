import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { AuthButton } from "@/components/AuthButton";

// Not linked from nav - kept from Phase 1 to verify the Discord login ->
// portal-api /auth/resolve -> session chain still works end-to-end.
export default async function DebugPage() {
  const session = await getServerSession(authOptions);

  return (
    <main>
      <h1>Debug: session</h1>
      <AuthButton signedIn={Boolean(session)} />
      {session && (
        <dl>
          <dt>Discord</dt>
          <dd>{session.user?.name ?? "unknown"}</dd>
          <dt>Account ID</dt>
          <dd>{session.accountId ?? "not linked - join the server first"}</dd>
          <dt>Staff</dt>
          <dd>{session.isStaff ? "yes" : "no"}</dd>
          <dt>Permissions</dt>
          <dd>{session.permissions.length > 0 ? session.permissions.join(", ") : "none"}</dd>
        </dl>
      )}
    </main>
  );
}
