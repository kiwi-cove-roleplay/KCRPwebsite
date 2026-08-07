"use client";

import { signIn } from "next-auth/react";
import { buttonClasses, type ButtonVariant } from "@/components/ui/Button";

// Signing in with Discord *is* account creation (see lib/auth.ts's
// PrismaAdapter) - there's no separate signup step, so this just starts
// that same flow under a more inviting label for first-time visitors.
export function GetStartedButton({
  label = "Create Account",
  variant = "primary",
}: {
  label?: string;
  variant?: ButtonVariant;
}) {
  return (
    <button className={buttonClasses(variant)} onClick={() => signIn("discord")}>
      {label}
    </button>
  );
}
