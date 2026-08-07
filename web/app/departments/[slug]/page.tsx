import Link from "next/link";
import { notFound } from "next/navigation";
import { Flame, HeartPulse, Shield } from "lucide-react";
import { buttonClasses } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { DEPARTMENT_ACCENT_CLASSES, getDepartmentBySlug } from "@/lib/departments";
import type { DepartmentCode } from "@/lib/portalApi";

const DEPARTMENT_ICONS: Record<DepartmentCode, typeof Shield> = {
  NZP: Shield,
  FENZ: Flame,
  HHSJ: HeartPulse,
};

export default function DepartmentPage({ params }: { params: { slug: string } }) {
  const department = getDepartmentBySlug(params.slug);
  if (!department) {
    notFound();
  }

  const accent = DEPARTMENT_ACCENT_CLASSES[department.accent];
  const Icon = DEPARTMENT_ICONS[department.code];

  return (
    <div className="space-y-8">
      <header className="space-y-4">
        <div className={`flex h-14 w-14 items-center justify-center rounded-xl text-bone shadow-glow-sm ${accent.iconBg}`}>
          <Icon className="h-7 w-7" />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl text-bone">{department.name}</h1>
          <Badge tone={department.recruitmentOpen ? "success" : "neutral"}>
            {department.recruitmentOpen ? "Recruiting" : "Closed"}
          </Badge>
        </div>
        <p className="text-muted">{department.summary}</p>
      </header>

      <ul className="grid gap-3 sm:grid-cols-3">
        {department.features.map((feature) => (
          <li key={feature} className={`rounded-xl border border-line bg-surface px-4 py-3 text-sm ${accent.text}`}>
            {feature}
          </li>
        ))}
      </ul>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <h2 className="text-lg text-bone">Rank Structure</h2>
          <ol className="mt-3 space-y-2 text-sm">
            {department.ranks.map((rank, index) => (
              <li key={rank} className="flex items-center gap-3 text-muted">
                <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-bone ${accent.iconBg}`}>
                  {index + 1}
                </span>
                {rank}
              </li>
            ))}
          </ol>
        </Card>
        <Card>
          <h2 className="text-lg text-bone">Requirements to Join</h2>
          <ul className="mt-3 space-y-2 text-sm text-muted">
            {department.requirements.map((requirement) => (
              <li key={requirement} className="flex items-start gap-2">
                <span className={accent.text}>›</span>
                {requirement}
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {department.recruitmentOpen ? (
        <Link href={`/departments/${department.slug}/apply`} className={buttonClasses("primary")}>
          Apply Now
        </Link>
      ) : (
        <p className="text-sm text-muted">Recruitment is currently closed. Check back later.</p>
      )}
    </div>
  );
}
