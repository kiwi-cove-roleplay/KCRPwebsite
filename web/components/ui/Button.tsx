export type ButtonVariant = "primary" | "secondary" | "ghost";

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold "
  + "transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none";

const VARIANTS: Record<ButtonVariant, string> = {
  primary: "bg-gradient-primary text-bone shadow-glow-sm hover:shadow-glow hover:-translate-y-0.5",
  secondary:
    "border border-sand-600/50 text-sand hover:border-sand-300/70 hover:bg-surface-raised hover:-translate-y-0.5",
  ghost: "text-bone hover:bg-surface-raised",
};

// Returns classes rather than a wrapping component so the same styling
// applies whether the element underneath needs to be a <button> (forms,
// signIn/signOut) or a <Link> (navigational CTAs).
export function buttonClasses(variant: ButtonVariant = "primary", className = ""): string {
  return [BASE, VARIANTS[variant], className].filter(Boolean).join(" ");
}
