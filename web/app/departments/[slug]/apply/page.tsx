import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { getDepartmentBySlug } from "@/lib/departments";
import { ApplicationForm } from "@/components/ApplicationForm";
import { AuthButton } from "@/components/AuthButton";

// Reachable by direct link regardless of the department's recruitmentOpen
// flag - see lib/departments.ts - so the full submission flow can be
// exercised before it's advertised publicly.
export default async function ApplyPage({ params }: { params: { slug: string } }) {
  const department = getDepartmentBySlug(params.slug);
  if (!department) {
    notFound();
  }

  const session = await getServerSession(authOptions);
  const canApply = Boolean(session) && session?.accountId !== null;

  return (
    <main>
      <h1>Apply — {department.name}</h1>
      {canApply ? (
        <ApplicationForm departmentCode={department.code} />
      ) : (
        <div>
          <p>
            Sign in with Discord to apply. If you&apos;ve never connected to the FiveM server,
            do that first — applications require a linked account.
          </p>
          <AuthButton signedIn={Boolean(session)} />
        </div>
      )}
    </main>
  );
}
