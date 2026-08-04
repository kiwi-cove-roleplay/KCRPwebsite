import Link from "next/link";
import { DEPARTMENTS } from "@/lib/departments";

export default function DepartmentsPage() {
  return (
    <main>
      <h1>Emergency Departments</h1>
      <p>Live counts of who&apos;s currently on duty: <Link href="/status">Live Status</Link>.</p>
      <ul>
        {DEPARTMENTS.map((department) => (
          <li key={department.slug}>
            <Link href={`/departments/${department.slug}`}>{department.name}</Link> —{" "}
            {department.summary}
            {!department.recruitmentOpen && " (recruitment currently closed)"}
          </li>
        ))}
      </ul>
    </main>
  );
}
