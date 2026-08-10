import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { fetchPortalSummary, type ApplicationStatus, type PortalCharacter } from "@/lib/portalApi";
import { listMyApplications } from "@/lib/applications";
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

  if (!session) {
    return (
      <div className="mx-auto max-w-xl space-y-8">
        <PageHeader title="My Portal" />
        <Card className="space-y-4 text-center">
          <p className="text-sm text-muted">Sign in with Discord to see your account.</p>
          <div className="flex justify-center">
            <AuthButton signedIn={false} />
          </div>
        </Card>
      </div>
    );
  }

  // Applications live in this website's own database (lib/applications.ts)
  // and always resolve. Characters only exist in the game's database, so
  // that section degrades on its own when there's no game link yet or
  // portal-api can't be reached - it never blocks the rest of the page.
  const applications = await listMyApplications(session.websiteUserId);

  let characters: PortalCharacter[] | null = null;
  let charactersUnavailable = false;
  if (session.accountId !== null && session.discordId) {
    try {
      const summary = await fetchPortalSummary(session.accountId, session.discordId);
      characters = summary.characters;
    } catch (error) {
      console.error("Failed to load portal summary from portal-api", error);
      charactersUnavailable = true;
    }
  }

  return (
    <div className="space-y-8">
      <PageHeader title="My Portal" />

      <Card>
        <h2 className="text-lg text-bone">Account</h2>
        <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          <dt className="text-muted">Discord</dt>
          <dd className="text-bone">{session.user?.name ?? "unknown"}</dd>
          <dt className="text-muted">Game server link</dt>
          <dd>
            {session.accountId !== null ? (
              <Badge tone="success">Linked — #{session.accountId}</Badge>
            ) : (
              <Badge tone="neutral">Not linked yet</Badge>
            )}
          </dd>
        </dl>
      </Card>

      <Card>
        <h2 className="text-lg text-bone">Characters</h2>
        {charactersUnavailable ? (
          <p className="mt-2 text-sm text-muted">
            Couldn&apos;t reach the game server to load your characters. Try again later.
          </p>
        ) : characters === null ? (
          <p className="mt-2 text-sm text-muted">
            Not connected to the game server yet — connect once via the FiveM client, then sign in again to link
            your character data here.
          </p>
        ) : characters.length === 0 ? (
          <p className="mt-2 text-sm text-muted">No active characters yet.</p>
        ) : (
          <ul className="mt-3 divide-y divide-line">
            {characters.map((character) => (
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
        {applications.length === 0 ? (
          <p className="mt-2 text-sm text-muted">You haven&apos;t submitted any department applications.</p>
        ) : (
          <ul className="mt-3 divide-y divide-line">
            {applications.map((application) => (
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
