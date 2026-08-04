import type { ReactNode } from "react";

export type BadgeTone = "neutral" | "success" | "warning" | "danger";

const TONES: Record<BadgeTone, string> = {
  neutral: "bg-surface-raised text-muted border-line",
  success: "bg-moss-700/40 text-moss-400 border-moss-600/40",
  warning: "bg-sand-600/20 text-sand-300 border-sand-600/40",
  danger: "bg-red-900/30 text-red-300 border-red-800/40",
};

export function Badge({ tone = "neutral", children }: { tone?: BadgeTone; children: ReactNode }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${TONES[tone]}`}>
      {children}
    </span>
  );
}
