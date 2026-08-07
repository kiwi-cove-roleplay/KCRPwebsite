import Link from "next/link";
import { Flame, HeartPulse, Shield } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { DEPARTMENTS, DEPARTMENT_ACCENT_CLASSES } from "@/lib/departments";
import type { DepartmentCode } from "@/lib/portalApi";

const DEPARTMENT_ICONS: Record<DepartmentCode, typeof Shield> = {
  NZP: Shield,
  FENZ: Flame,
  HHSJ: HeartPulse,
};

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
          const Icon = DEPARTMENT_ICONS[department.code];
          return (
            <Card key={department.slug} className="flex flex-col transition-all hover:-translate-y-0.5">
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl text-bone shadow-glow-sm ${accent.iconBg}`}>
                <Icon className="h-6 w-6" />
              </div>
              <h2 className="mt-4 text-lg text-bone">{department.name}</h2>
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
