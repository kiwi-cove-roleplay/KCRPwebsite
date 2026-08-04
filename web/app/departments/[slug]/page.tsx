import Link from "next/link";
import { notFound } from "next/navigation";
import { buttonClasses } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { DEPARTMENT_ACCENT_CLASSES, getDepartmentBySlug } from "@/lib/departments";

export default function DepartmentPage({ params }: { params: { slug: string } }) {
  const department = getDepartmentBySlug(params.slug);
  if (!department) {
    notFound();
  }

  const accent = DEPARTMENT_ACCENT_CLASSES[department.accent];

  return (
    <div className="space-y-8">
      <header className={`space-y-2 border-t-2 pt-6 ${accent.border}`}>
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
          <li key={feature} className={`rounded-md border border-line bg-surface px-4 py-3 text-sm ${accent.text}`}>
            {feature}
          </li>
        ))}
      </ul>

      <p className="text-sm text-muted">Rank structure and SOPs go here.</p>

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
