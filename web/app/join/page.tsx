import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";

const STEPS = [
  { title: "Read the rules", body: "Start with the server rules so you know what's expected." },
  { title: "Join the Discord", body: "Community coordination, support, and announcements happen there." },
  { title: "Connect to the server", body: "Connect once via the FiveM client to link your Discord account." },
  { title: "Create a character", body: "Sign in here with Discord afterwards to see your account and characters." },
];

export default function JoinPage() {
  return (
    <div className="space-y-8">
      <PageHeader title="How to Join" />
      <ol className="space-y-4">
        {STEPS.map((step, index) => (
          <li key={step.title} className="flex gap-4">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-primary text-sm font-semibold text-bone shadow-glow-sm">
              {index + 1}
            </span>
            <div>
              <p className="font-medium text-bone">{step.title}</p>
              <p className="text-sm text-muted">{step.body}</p>
            </div>
          </li>
        ))}
      </ol>
      <p className="text-sm text-muted">
        Interested in an emergency-services role? See{" "}
        <Link href="/departments" className="text-moss-400 hover:underline">
          Departments
        </Link>
        .
      </p>
    </div>
  );
}
