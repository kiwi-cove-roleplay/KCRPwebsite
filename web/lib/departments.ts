import type { DepartmentCode } from "@/lib/portalApi";

export type DepartmentAccent = "blue" | "red" | "amber";

export interface DepartmentInfo {
  code: DepartmentCode;
  slug: string;
  name: string;
  summary: string;
  features: string[];
  accent: DepartmentAccent;
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
    features: ["Patrol & investigations", "AOS tactical response", "Structured rank progression"],
    accent: "blue",
    recruitmentOpen: false,
  },
  {
    code: "FENZ",
    slug: "fenz",
    name: "Fire and Emergency New Zealand",
    summary: "Structure fires, road crash rescue, and hazmat response.",
    features: ["Structure fire response", "Road crash rescue", "Hazmat & rescue ops"],
    accent: "red",
    recruitmentOpen: false,
  },
  {
    code: "HHSJ",
    slug: "hhsj",
    name: "Hato Hone St John",
    summary: "Ambulance and emergency medical response.",
    features: ["Emergency medical response", "Ambulance operations", "Hospital & triage RP"],
    accent: "amber",
    recruitmentOpen: false,
  },
];

export function getDepartmentBySlug(slug: string): DepartmentInfo | undefined {
  return DEPARTMENTS.find((department) => department.slug === slug);
}

// Full class strings (not built via template interpolation) so Tailwind's
// content scan can find them - see tailwind.config.ts's content globs.
export const DEPARTMENT_ACCENT_CLASSES: Record<
  DepartmentAccent,
  { border: string; text: string; iconBg: string }
> = {
  blue: { border: "border-t-blue-500", text: "text-blue-400", iconBg: "bg-gradient-to-br from-blue-500 to-blue-800" },
  red: { border: "border-t-red-500", text: "text-red-400", iconBg: "bg-gradient-to-br from-red-500 to-red-800" },
  amber: {
    border: "border-t-amber-500",
    text: "text-amber-400",
    iconBg: "bg-gradient-to-br from-amber-500 to-amber-800",
  },
};
