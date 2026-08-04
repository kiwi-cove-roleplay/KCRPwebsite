import { StatusBoard } from "@/components/StatusBoard";

export default function StatusPage() {
  return (
    <main>
      <h1>Who&apos;s on Duty</h1>
      <p>Updates automatically about once a minute while the server is online.</p>
      <StatusBoard />
    </main>
  );
}
