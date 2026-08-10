import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { buttonClasses } from "@/components/ui/Button";
import { AuthButton } from "@/components/AuthButton";

// Codes next-auth can hand back via ?error=; see
// https://next-auth.js.org/configuration/pages#error-page. Anything not
// listed here falls through to the Default message below.
const MESSAGES: Record<string, string> = {
  AccessDenied: "You declined the Discord authorization request, so we couldn't sign you in.",
  Configuration: "Sign-in is misconfigured on our end. Please try again shortly or let staff know.",
  Verification: "That sign-in link has expired or was already used.",
  OAuthSignin: "We couldn't start the Discord sign-in. Please try again.",
  OAuthCallback: "Discord's response couldn't be verified, often because the sign-in took too long or cookies were blocked. Please try again.",
  OAuthCreateAccount: "We couldn't create an account from your Discord profile. Please try again.",
  Callback: "Something went wrong completing sign-in. Please try again.",
  OAuthAccountNotLinked: "That Discord account is linked to a different sign-in method already in use here.",
  Default: "Something went wrong signing you in. Please try again.",
};

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const message = (error && MESSAGES[error]) ?? MESSAGES.Default;

  return (
    <div className="space-y-8">
      <PageHeader title="Sign-in error">{message}</PageHeader>
      <div className="flex gap-3">
        <AuthButton signedIn={false} />
        <Link href="/" className={buttonClasses("secondary")}>
          Back home
        </Link>
      </div>
    </div>
  );
}
