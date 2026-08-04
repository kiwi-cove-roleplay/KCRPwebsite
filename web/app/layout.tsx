import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { AuthButton } from "@/components/AuthButton";

export const metadata: Metadata = {
  title: "Kiwi Cove Roleplay",
  description: "Kiwi Cove Roleplay - community, recruitment, and player portal.",
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en">
      <body>
        <header>
          <nav>
            <Link href="/">Kiwi Cove Roleplay</Link>
            <Link href="/rules">Rules</Link>
            <Link href="/join">How to Join</Link>
            <Link href="/departments">Departments</Link>
            <Link href="/status">Live Status</Link>
          </nav>
          <AuthButton signedIn={Boolean(session)} />
        </header>
        {children}
      </body>
    </html>
  );
}
