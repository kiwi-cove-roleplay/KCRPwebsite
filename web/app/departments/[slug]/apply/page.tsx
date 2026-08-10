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

  return (
    <div className="mx-auto max-w-xl space-y-8">
      <PageHeader title={`Apply — ${department.name}`} />
      {session ? (
        <ApplicationForm departmentCode={department.code} />
      ) : (
        <Card className="space-y-4 text-center">
          <p className="text-sm text-muted">Sign in with Discord to apply.</p>
          <div className="flex justify-center">
            <AuthButton signedIn={false} />
          </div>
        </Card>
      )}
    </div>
  );
}
