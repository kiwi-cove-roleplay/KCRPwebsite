import Link from "next/link";

const STEPS = [
  { title: "Read the rules", body: "Start with the server rules so you know what's expected." },
  { title: "Join the Discord", body: "Community coordination, support, and announcements happen there." },
  { title: "Connect to the server", body: "Connect once via the FiveM client to link your Discord account." },
  { title: "Create a character", body: "Sign in here with Discord afterwards to see your account and characters." },
];

export default function JoinPage() {
  return (
    <main>
      <h1>How to Join</h1>
      <ol>
        {STEPS.map((step) => (
          <li key={step.title}>
            <strong>{step.title}</strong> — {step.body}
          </li>
        ))}
      </ol>
      <p>
        Interested in an emergency-services role? See{" "}
        <Link href="/departments">Departments</Link>.
      </p>
    </main>
  );
}
