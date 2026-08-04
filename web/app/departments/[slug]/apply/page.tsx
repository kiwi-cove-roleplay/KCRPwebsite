import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { getDepartmentBySlug } from "@/lib/departments";
import { ApplicationForm } from "@/components/ApplicationForm";
import { AuthButton } from "@/components/AuthButton";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";

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
    <div className="mx-auto max-w-xl space-y-8">
      <PageHeader title={`Apply — ${department.name}`} />
      {canApply ? (
        <ApplicationForm departmentCode={department.code} />
      ) : (
        <Card className="space-y-4 text-center">
          <p className="text-sm text-muted">
            Sign in with Discord to apply. If you&apos;ve never connected to the FiveM server,
            do that first — applications require a linked account.
          </p>
          <div className="flex justify-center">
            <AuthButton signedIn={Boolean(session)} />
          </div>
        </Card>
      )}
    </div>
  );
}
