import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { fetchPortalSummary, type ApplicationStatus } from "@/lib/portalApi";
import { AuthButton } from "@/components/AuthButton";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge, type BadgeTone } from "@/components/ui/Badge";

const STATUS_LABELS: Record<ApplicationStatus, string> = {
  pending: "Pending review",
  accepted: "Accepted",
  rejected: "Rejected",
};

const STATUS_TONES: Record<ApplicationStatus, BadgeTone> = {
  pending: "warning",
  accepted: "success",
  rejected: "danger",
};

export default async function PortalPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.accountId === null || !session.discordId) {
    return (
      <div className="mx-auto max-w-xl space-y-8">
        <PageHeader title="My Portal" />
        <Card className="space-y-4 text-center">
          <p className="text-sm text-muted">
            Sign in with Discord to see your account. If you&apos;ve never connected to the
            FiveM server, do that first — the portal only works for a linked account.
          </p>
          <div className="flex justify-center">
            <AuthButton signedIn={Boolean(session)} />
          </div>
        </Card>
      </div>
    );
  }

  const summary = await fetchPortalSummary(session.accountId, session.discordId);

  return (
    <div className="space-y-8">
      <PageHeader title="My Portal" />

      <Card>
        <h2 className="text-lg text-bone">Account</h2>
        <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          <dt className="text-muted">Discord</dt>
          <dd className="text-bone">{session.user?.name ?? "unknown"}</dd>
          <dt className="text-muted">Account ID</dt>
          <dd className="text-bone">{session.accountId}</dd>
        </dl>
      </Card>

      <Card>
        <h2 className="text-lg text-bone">Characters</h2>
        {summary.characters.length === 0 ? (
          <p className="mt-2 text-sm text-muted">No active characters yet.</p>
        ) : (
          <ul className="mt-3 divide-y divide-line">
            {summary.characters.map((character) => (
              <li key={character.character_id} className="flex items-center justify-between py-2 text-sm">
                <span className="text-bone">
                  {character.first_name} {character.last_name}
                  {character.agency_code ? ` — ${character.agency_code}` : ""}
                </span>
                <Badge tone={character.duty_status === "on_duty" ? "success" : "neutral"}>
                  {character.duty_status === "on_duty" ? "On duty" : "Off duty"}
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card>
        <h2 className="text-lg text-bone">My Applications</h2>
        {summary.applications.length === 0 ? (
          <p className="mt-2 text-sm text-muted">You haven&apos;t submitted any department applications.</p>
        ) : (
          <ul className="mt-3 divide-y divide-line">
            {summary.applications.map((application) => (
              <li key={application.id} className="flex items-center justify-between py-2 text-sm">
                <span className="text-bone">
                  {application.department} — submitted {new Date(application.created_at).toLocaleDateString()}
                </span>
                <Badge tone={STATUS_TONES[application.status]}>{STATUS_LABELS[application.status]}</Badge>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
