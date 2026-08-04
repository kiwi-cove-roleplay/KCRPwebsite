import type { DepartmentCode } from "@/lib/portalApi";

export interface DepartmentInfo {
  code: DepartmentCode;
  slug: string;
  name: string;
  summary: string;
  // Whether the public department page links to the apply form. The apply
  // route itself always works regardless of this flag - see
  // app/departments/[slug]/apply/page.tsx - so staff can exercise the full
  // submission flow before advertising it.
  recruitmentOpen: boolean;
}

export const DEPARTMENTS: DepartmentInfo[] = [
  {
    code: "NZP",
    slug: "nzp",
    name: "New Zealand Police",
    summary: "Frontline patrol, investigations, and the AOS.",
    recruitmentOpen: false,
  },
  {
    code: "FENZ",
    slug: "fenz",
    name: "Fire and Emergency New Zealand",
    summary: "Structure fires, road crash rescue, and hazmat response.",
    recruitmentOpen: false,
  },
  {
    code: "HHSJ",
    slug: "hhsj",
    name: "Hato Hone St John",
    summary: "Ambulance and emergency medical response.",
    recruitmentOpen: false,
  },
];

export function getDepartmentBySlug(slug: string): DepartmentInfo | undefined {
  return DEPARTMENTS.find((department) => department.slug === slug);
}
