import type { ReactNode } from "react";

export type IconTileTone = "moss" | "sand" | "gold";

const TONES: Record<IconTileTone, string> = {
  moss: "bg-gradient-to-br from-moss-500 to-moss-700 text-ink",
  sand: "bg-gradient-to-br from-sand-300 to-sand-600 text-ink",
  gold: "bg-gradient-to-br from-gold-400 to-gold-600 text-ink",
};

// Rounded gradient square icon container - the colored icon tiles used
// across feature/department cards.
export function IconTile({
  children,
  tone = "moss",
  className = "",
}: {
  children: ReactNode;
  tone?: IconTileTone;
  className?: string;
}) {
  return (
    <div
      className={`flex h-12 w-12 items-center justify-center rounded-xl shadow-glow-sm ${TONES[tone]} ${className}`}
    >
      {children}
    </div>
  );
}
