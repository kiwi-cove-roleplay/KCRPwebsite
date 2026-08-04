import Link from "next/link";

export default function HomePage() {
  return (
    <main>
      <h1>Kiwi Cove Roleplay</h1>
      <p>A New Zealand-based FiveM roleplay community.</p>
      <p>
        <Link href="/join">How to join</Link> · <Link href="/rules">Server rules</Link> ·{" "}
        <Link href="/departments">Emergency departments</Link> ·{" "}
        <Link href="/status">Who&apos;s on duty</Link>
      </p>
    </main>
  );
}
