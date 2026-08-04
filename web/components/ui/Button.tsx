export type ButtonVariant = "primary" | "secondary" | "ghost";

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium "
  + "transition-colors disabled:opacity-50 disabled:pointer-events-none";

const VARIANTS: Record<ButtonVariant, string> = {
  primary: "bg-moss-600 text-ink hover:bg-moss-400",
  secondary: "border border-sand-600/50 text-sand hover:bg-surface-raised",
  ghost: "text-bone hover:bg-surface-raised",
};

// Returns classes rather than a wrapping component so the same styling
// applies whether the element underneath needs to be a <button> (forms,
// signIn/signOut) or a <Link> (navigational CTAs).
export function buttonClasses(variant: ButtonVariant = "primary", className = ""): string {
  return [BASE, VARIANTS[variant], className].filter(Boolean).join(" ");
}
