"use client";

import { signIn, signOut } from "next-auth/react";
import { buttonClasses } from "@/components/ui/Button";

export function AuthButton({ signedIn }: { signedIn: boolean }) {
  return signedIn ? (
    <button className={buttonClasses("secondary")} onClick={() => signOut()}>
      Sign out
    </button>
  ) : (
    <button className={buttonClasses("primary")} onClick={() => signIn("discord")}>
      Sign in with Discord
    </button>
  );
}
