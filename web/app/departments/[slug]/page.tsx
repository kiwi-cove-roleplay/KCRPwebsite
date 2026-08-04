import Link from "next/link";
import { notFound } from "next/navigation";
import { getDepartmentBySlug } from "@/lib/departments";

export default function DepartmentPage({ params }: { params: { slug: string } }) {
  const department = getDepartmentBySlug(params.slug);
  if (!department) {
    notFound();
  }

  return (
    <main>
      <h1>{department.name}</h1>
      <p>{department.summary}</p>
      <p>Rank structure and SOPs go here.</p>
      {department.recruitmentOpen ? (
        <p>
          <Link href={`/departments/${department.slug}/apply`}>Apply now</Link>
        </p>
      ) : (
        <p>Recruitment is currently closed. Check back later.</p>
      )}
    </main>
  );
}
