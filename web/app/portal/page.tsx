import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { fetchPortalSummary } from "@/lib/portalApi";
import { AuthButton } from "@/components/AuthButton";

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending review",
  accepted: "Accepted",
  rejected: "Rejected",
};

export default async function PortalPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.accountId === null || !session.discordId) {
    return (
      <main>
        <h1>My Portal</h1>
        <p>
          Sign in with Discord to see your account. If you&apos;ve never connected to the
          FiveM server, do that first — the portal only works for a linked account.
        </p>
        <AuthButton signedIn={Boolean(session)} />
      </main>
    );
  }

  const summary = await fetchPortalSummary(session.accountId, session.discordId);

  return (
    <main>
      <h1>My Portal</h1>

      <section>
        <h2>Account</h2>
        <dl>
          <dt>Discord</dt>
          <dd>{session.user?.name ?? "unknown"}</dd>
          <dt>Account ID</dt>
          <dd>{session.accountId}</dd>
        </dl>
      </section>

      <section>
        <h2>Characters</h2>
        {summary.characters.length === 0 ? (
          <p>No active characters yet.</p>
        ) : (
          <ul>
            {summary.characters.map((character) => (
              <li key={character.character_id}>
                {character.first_name} {character.last_name}
                {character.agency_code ? ` — ${character.agency_code}` : ""} (
                {character.duty_status === "on_duty" ? "on duty" : "off duty"})
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2>My Applications</h2>
        {summary.applications.length === 0 ? (
          <p>You haven&apos;t submitted any department applications.</p>
        ) : (
          <ul>
            {summary.applications.map((application) => (
              <li key={application.id}>
                {application.department} — {STATUS_LABELS[application.status] ?? application.status} (submitted{" "}
                {new Date(application.created_at).toLocaleDateString()})
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
