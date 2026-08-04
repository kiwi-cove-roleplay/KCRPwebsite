import Link from "next/link";
import { buttonClasses } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

const QUICK_LINKS = [
  { href: "/join", title: "How to Join", body: "Steps to get connected and playing." },
  { href: "/rules", title: "Server Rules", body: "What's expected once you're in." },
  { href: "/departments", title: "Departments", body: "PD, Fire, and Ambulance recruitment." },
  { href: "/status", title: "Live Status", body: "Who's on duty right now." },
] as const;

export default function HomePage() {
  return (
    <div className="space-y-16">
      <section className="space-y-6 py-8 text-center">
        <h1 className="text-4xl font-semibold text-bone sm:text-5xl">Kiwi Cove Roleplay</h1>
        <p className="mx-auto max-w-xl text-lg text-muted">
          A New Zealand-based FiveM roleplay community, set in Ōtautahi Christchurch.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
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
            <Card className="h-full transition-colors hover:border-moss-600/60">
              <h2 className="text-xl text-bone">{link.title}</h2>
              <p className="mt-2 text-sm text-muted">{link.body}</p>
            </Card>
          </Link>
        ))}
      </section>
    </div>
  );
}
