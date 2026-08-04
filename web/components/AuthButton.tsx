"use client";

import { signIn, signOut } from "next-auth/react";

export function AuthButton({ signedIn }: { signedIn: boolean }) {
  return signedIn ? (
    <button onClick={() => signOut()}>Sign out</button>
  ) : (
    <button onClick={() => signIn("discord")}>Sign in with Discord</button>
  );
}
