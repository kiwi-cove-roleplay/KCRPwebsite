import Link from "next/link";
import { Compass, MapPin, Radio, ScrollText, ShieldCheck } from "lucide-react";
import { buttonClasses } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { IconTile, type IconTileTone } from "@/components/ui/IconTile";
import { Pill } from "@/components/ui/Pill";

const QUICK_LINKS = [
  {
    href: "/join",
    title: "How to Join",
    body: "Steps to get connected and playing.",
    icon: Compass,
    tone: "moss",
  },
  {
    href: "/rules",
    title: "Server Rules",
    body: "What's expected once you're in.",
    icon: ScrollText,
    tone: "sand",
  },
  {
    href: "/departments",
    title: "Departments",
    body: "PD, Fire, and Ambulance recruitment.",
    icon: ShieldCheck,
    tone: "gold",
  },
  {
    href: "/status",
    title: "Live Status",
    body: "Who's on duty right now.",
    icon: Radio,
    tone: "moss",
  },
] satisfies { href: string; title: string; body: string; icon: typeof Compass; tone: IconTileTone }[];

export default function HomePage() {
  return (
    <div className="space-y-20">
      <section className="-mx-4 space-y-6 rounded-3xl bg-hero-glow px-4 py-16 text-center sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div className="flex justify-center">
          <Pill>
            <MapPin className="h-4 w-4 text-moss-400" />
            Ōtautahi Christchurch, New Zealand
          </Pill>
        </div>
        <h1 className="text-4xl font-semibold text-bone sm:text-6xl">
          Kiwi Cove <span className="text-gradient-brand">Roleplay</span>
        </h1>
        <p className="mx-auto max-w-xl text-lg text-muted">
          A New Zealand-based FiveM roleplay community, set in Ōtautahi Christchurch.
        </p>
        <div className="flex flex-wrap justify-center gap-4 pt-2">
          <Link href="/join" className={buttonClasses("primary")}>
            How to Join
          </Link>
          <Link href="/departments" className={buttonClasses("secondary")}>
            View Departments
          </Link>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        {QUICK_LINKS.map((link) => (
          <Link key={link.href} href={link.href}>
            <Card className="flex h-full items-start gap-4 transition-all hover:-translate-y-0.5 hover:border-moss-600/60">
              <IconTile tone={link.tone}>
                <link.icon className="h-6 w-6" />
              </IconTile>
              <div>
                <h2 className="text-xl text-bone">{link.title}</h2>
                <p className="mt-1 text-sm text-muted">{link.body}</p>
              </div>
            </Card>
          </Link>
        ))}
      </section>
    </div>
  );
}
