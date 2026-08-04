import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { AuthButton } from "@/components/AuthButton";

// Phase 1 placeholder: proves the Discord login -> portal-api resolve ->
// session round trip works end-to-end. Real site content (public pages,
// recruitment, player portal, admin dashboard) is later phases - see
// docs/architecture.md's "Community Web Platform" section.
export default async function HomePage() {
  const session = await getServerSession(authOptions);

  return (
    <main>
      <h1>Kiwi Cove Roleplay</h1>
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
