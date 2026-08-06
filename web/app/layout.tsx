import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter, Oswald } from "next/font/google";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { AuthButton } from "@/components/AuthButton";
import { STAFF_ADMIN_PERMISSION } from "@/lib/requireAdmin";
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

const FOOTER_SECTIONS = [
  {
    heading: "Community",
    links: [
      { href: "/rules", label: "Rules" },
      { href: "/join", label: "How to Join" },
      { href: "/departments", label: "Departments" },
      { href: "/status", label: "Live Status" },
    ],
  },
  {
    heading: "Account",
    links: [
      { href: "/portal", label: "My Portal" },
      { href: "/departments", label: "Apply Now" },
    ],
  },
] as const;

export default async function RootLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en" className={`${sans.variable} ${display.variable}`}>
      <body className="flex min-h-screen flex-col font-sans">
        <header className="sticky top-0 z-10 border-b border-line/80 bg-ink/85 backdrop-blur-md">
          <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-x-6 gap-y-3 px-4 py-3 sm:px-6 lg:px-8">
            <Link href="/" className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png" alt="Kiwi Cove Roleplay" className="h-12 w-auto drop-shadow-[0_0_12px_rgba(124,143,74,0.35)]" />
            </Link>
            <nav className="flex flex-1 flex-wrap items-center gap-x-1 gap-y-2 text-sm">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-full px-3 py-1.5 font-medium text-muted transition-colors hover:bg-surface-raised hover:text-bone"
                >
                  {link.label}
                </Link>
              ))}
              {session && (
                <Link
                  href="/portal"
                  className="rounded-full px-3 py-1.5 font-medium text-muted transition-colors hover:bg-surface-raised hover:text-bone"
                >
                  My Portal
                </Link>
              )}
              {session?.permissions.includes(STAFF_ADMIN_PERMISSION) && (
                <Link
                  href="/admin"
                  className="rounded-full px-3 py-1.5 font-medium text-muted transition-colors hover:bg-surface-raised hover:text-bone"
                >
                  Admin
                </Link>
              )}
            </nav>
            <AuthButton signedIn={Boolean(session)} />
          </div>
        </header>

        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 sm:px-6 lg:px-8">{children}</main>

        <footer className="border-t border-line/80 bg-surface/40">
          <div className="mx-auto grid w-full max-w-5xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.4fr_1fr_1fr] lg:px-8">
            <div className="space-y-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png" alt="Kiwi Cove Roleplay" className="h-14 w-auto" />
              <p className="max-w-xs text-sm text-muted">
                A New Zealand-based FiveM roleplay community, set in Ōtautahi Christchurch.
              </p>
            </div>
            {FOOTER_SECTIONS.map((section) => (
              <div key={section.heading} className="space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-widest text-sand">{section.heading}</h3>
                <ul className="space-y-2 text-sm">
                  {section.links.map((link) => (
                    <li key={link.label}>
                      <Link href={link.href} className="text-muted transition-colors hover:text-bone">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-line/60">
            <div className="mx-auto w-full max-w-5xl px-4 py-5 text-center text-xs text-muted sm:px-6 lg:px-8">
              © {new Date().getFullYear()} Kiwi Cove Roleplay — Ōtautahi Christchurch, NZ FiveM roleplay community.
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
