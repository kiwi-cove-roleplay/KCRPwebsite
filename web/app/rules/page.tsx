import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";

// Placeholder copy - replace each section body with the community's actual
// rules before launch.
const RULE_SECTIONS = [
  {
    title: "Roleplay quality",
    body: "Stay in character, engage with fear/injury RP, and avoid metagaming or powergaming.",
  },
  {
    title: "Conduct",
    body: "Treat other players and staff with respect. Harassment, hate speech, and cheating are not tolerated.",
  },
  {
    title: "Combat and RDM/VDM",
    body: "No random deathmatch or vehicle deathmatch - every action needs an in-character reason.",
  },
  {
    title: "Streaming and recording",
    body: "Follow the community's streamer tag rules if you plan to stream or record sessions.",
  },
];

export default function RulesPage() {
  return (
    <div className="space-y-8">
      <PageHeader title="Server Rules">The short version. Full rules are pinned in Discord.</PageHeader>
      <div className="grid gap-4 sm:grid-cols-2">
        {RULE_SECTIONS.map((section) => (
          <Card key={section.title}>
            <h2 className="text-lg text-bone">{section.title}</h2>
            <p className="mt-2 text-sm text-muted">{section.body}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
