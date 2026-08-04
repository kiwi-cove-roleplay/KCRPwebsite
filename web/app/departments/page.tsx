import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { DEPARTMENTS, DEPARTMENT_ACCENT_CLASSES } from "@/lib/departments";

export default function DepartmentsPage() {
  return (
    <div className="space-y-8">
      <PageHeader title="Emergency Departments">
        Live counts of who&apos;s currently on duty:{" "}
        <Link href="/status" className="text-moss-400 hover:underline">
          Live Status
        </Link>
        .
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-3">
        {DEPARTMENTS.map((department) => {
          const accent = DEPARTMENT_ACCENT_CLASSES[department.accent];
          return (
            <Card key={department.slug} className={`border-t-2 ${accent.border} flex flex-col`}>
              <h2 className="text-lg text-bone">{department.name}</h2>
              <p className="mt-1 text-sm text-muted">{department.summary}</p>
              <ul className="mt-4 space-y-1 text-sm text-muted">
                {department.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <span className={accent.text}>›</span>
                    {feature}
                  </li>
                ))}
              </ul>
              <div className="mt-4 flex items-center justify-between">
                <Link href={`/departments/${department.slug}`} className="text-sm font-medium text-bone hover:underline">
                  Learn more →
                </Link>
                {!department.recruitmentOpen && <Badge tone="neutral">Closed</Badge>}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
