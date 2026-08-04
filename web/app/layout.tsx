import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter, Oswald } from "next/font/google";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { AuthButton } from "@/components/AuthButton";
import "./globals.css";

const sans = Inter({ subsets: ["latin"], variable: "--font-sans" });
const display = Oswald({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--font-display" });

export const metadata: Metadata = {
  title: "Kiwi Cove Roleplay",
  description: "Kiwi Cove Roleplay - community, recruitment, and player portal.",
};

const NAV_LINKS = [
  { href: "/rules", label: "Rules" },
  { href: "/join", label: "How to Join" },
  { href: "/departments", label: "Departments" },
  { href: "/status", label: "Live Status" },
] as const;

export default async function RootLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en" className={`${sans.variable} ${display.variable}`}>
      <body className="flex min-h-screen flex-col font-sans">
        <header className="sticky top-0 z-10 border-b border-line bg-ink/90 backdrop-blur">
          <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-x-6 gap-y-3 px-4 py-3 sm:px-6 lg:px-8">
            <Link href="/" className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png" alt="Kiwi Cove Roleplay" className="h-12 w-auto" />
            </Link>
            <nav className="flex flex-1 flex-wrap items-center gap-x-5 gap-y-2 text-sm">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="font-medium text-muted transition-colors hover:text-bone"
                >
                  {link.label}
                </Link>
              ))}
              {session && (
                <Link
                  href="/portal"
                  className="font-medium text-muted transition-colors hover:text-bone"
                >
                  My Portal
                </Link>
              )}
            </nav>
            <AuthButton signedIn={Boolean(session)} />
          </div>
        </header>

        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 sm:px-6 lg:px-8">{children}</main>

        <footer className="border-t border-line">
          <div className="mx-auto w-full max-w-5xl px-4 py-6 text-center text-sm text-muted sm:px-6 lg:px-8">
            Kiwi Cove Roleplay — Ōtautahi Christchurch, NZ FiveM roleplay community.
          </div>
        </footer>
      </body>
    </html>
  );
}
