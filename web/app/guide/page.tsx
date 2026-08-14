import { BookOpen, Compass, Radio, ShieldQuestion, Siren, Users } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { IconTile, type IconTileTone } from "@/components/ui/IconTile";

// Placeholder copy - replace each section body with real content pulled
// from the sfos_core_2026 repo docs once it's provided.
const GUIDE_SECTIONS = [
  {
    title: "Getting Started",
    body: "Connecting to the server, character creation, and your first few minutes in Ōtautahi Christchurch.",
    icon: Compass,
    tone: "moss",
  },
  {
    title: "Roleplay Basics",
    body: "Core RP expectations - staying in character, fear/injury RP, and avoiding metagaming or powergaming.",
    icon: BookOpen,
    tone: "sand",
  },
  {
    title: "Departments & Careers",
    body: "How the emergency services departments (NZP, FENZ, HHSJ) work, and how to apply or progress in one.",
    icon: Siren,
    tone: "gold",
  },
  {
    title: "Community & Discord",
    body: "Where to find announcements, support tickets, and how the community's Discord ties into the server.",
    icon: Users,
    tone: "moss",
  },
  {
    title: "Systems Reference",
    body: "Walkthroughs for the server's gameplay systems - jobs, vehicles, housing, and anything else new players ask about.",
    icon: Radio,
    tone: "sand",
  },
  {
    title: "FAQ & Troubleshooting",
    body: "Answers to common questions and fixes for the issues new players run into most often.",
    icon: ShieldQuestion,
    tone: "gold",
  },
] satisfies { title: string; body: string; icon: typeof BookOpen; tone: IconTileTone }[];

export default function GuidePage() {
  return (
    <div className="space-y-8">
      <PageHeader title="Community Guide">
        Everything you need to know to play on Kiwi Cove Roleplay. This page is still being written up - check back
        soon for the full guide.
      </PageHeader>
      <div className="grid gap-4 sm:grid-cols-2">
        {GUIDE_SECTIONS.map((section) => (
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
