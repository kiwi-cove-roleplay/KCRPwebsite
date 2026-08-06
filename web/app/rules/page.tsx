import { MessageCircleWarning, ShieldAlert, Swords, Users, Video, Wand2 } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { IconTile, type IconTileTone } from "@/components/ui/IconTile";

// Placeholder copy - replace each section body with the community's actual
// rules before launch.
const RULE_SECTIONS = [
  {
    title: "Roleplay quality",
    body: "Stay in character, engage with fear/injury RP, and avoid metagaming or powergaming.",
    icon: Wand2,
    tone: "moss",
  },
  {
    title: "Conduct",
    body: "Treat other players and staff with respect. Harassment, hate speech, and cheating are not tolerated.",
    icon: Users,
    tone: "sand",
  },
  {
    title: "Combat and RDM/VDM",
    body: "No random deathmatch or vehicle deathmatch - every action needs an in-character reason.",
    icon: Swords,
    tone: "gold",
  },
  {
    title: "Streaming and recording",
    body: "Follow the community's streamer tag rules if you plan to stream or record sessions.",
    icon: Video,
    tone: "moss",
  },
  {
    title: "Reporting issues",
    body: "Use the in-game report command or open a Discord ticket - don't take rule disputes into your own hands.",
    icon: MessageCircleWarning,
    tone: "sand",
  },
  {
    title: "Enforcement",
    body: "Staff decisions follow a documented warning → kick → ban escalation. Appeals go through Discord.",
    icon: ShieldAlert,
    tone: "gold",
  },
] satisfies { title: string; body: string; icon: typeof Wand2; tone: IconTileTone }[];

export default function RulesPage() {
  return (
    <div className="space-y-8">
      <PageHeader title="Server Rules">
        The short version, so you know what's expected before you jump in. The full, binding rules are pinned in
        Discord - read those before you play.
      </PageHeader>
      <div className="grid gap-4 sm:grid-cols-2">
        {RULE_SECTIONS.map((section) => (
          <Card key={section.title} className="flex items-start gap-4">
            <IconTile tone={section.tone}>
              <section.icon className="h-6 w-6" />
            </IconTile>
            <div>
              <h2 className="text-lg text-bone">{section.title}</h2>
              <p className="mt-2 text-sm text-muted">{section.body}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
