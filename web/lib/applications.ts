// Department recruitment applications, stored entirely in this website's
// own Postgres database (see prisma/schema.prisma's Application model) -
// not portal-api's department_applications MySQL table. This is
// deliberate: applying and reviewing applications needs to work before
// there's a reachable game server/portal-api at all. Reconciling with the
// game database's copy is a later-date task, not a dependency of this
// module.
import type { Prisma } from "@prisma/client";
import { prisma } from "./prisma";
import type { ApplicationStatus, DepartmentCode } from "./portalApi";

export interface ApplicationRow {
  id: string;
  discord_identifier: string;
  discord_username: string;
  department: DepartmentCode;
  answers: Record<string, string>;
  status: ApplicationStatus;
  created_at: string;
  reviewed_at: string | null;
  reviewed_by_name: string | null;
}

const WITH_RELATIONS = {
  user: { select: { discordId: true, name: true } },
  reviewedBy: { select: { name: true } },
} satisfies Prisma.ApplicationInclude;

type ApplicationWithRelations = Prisma.ApplicationGetPayload<{ include: typeof WITH_RELATIONS }>;

function toRow(application: ApplicationWithRelations): ApplicationRow {
  return {
    id: application.id,
    discord_identifier: application.user.discordId ?? "unknown",
    discord_username: application.user.name ?? "unknown",
    department: application.department as DepartmentCode,
    answers: application.answers as Record<string, string>,
    status: application.status as ApplicationStatus,
    created_at: application.createdAt.toISOString(),
    reviewed_at: application.reviewedAt?.toISOString() ?? null,
    reviewed_by_name: application.reviewedBy?.name ?? null,
  };
}

export async function createApplication(
  userId: string,
  department: DepartmentCode,
  answers: Record<string, string>,
): Promise<ApplicationRow> {
  const application = await prisma.application.create({
    data: { userId, department, answers },
    include: WITH_RELATIONS,
  });
  return toRow(application);
}

export async function listMyApplications(userId: string): Promise<ApplicationRow[]> {
  const applications = await prisma.application.findMany({
    where: { userId },
    include: WITH_RELATIONS,
    orderBy: { createdAt: "desc" },
  });
  return applications.map(toRow);
}

export async function listApplicationsForAdmin(status?: ApplicationStatus): Promise<ApplicationRow[]> {
  const applications = await prisma.application.findMany({
    where: status ? { status } : undefined,
    include: WITH_RELATIONS,
    orderBy: { createdAt: "desc" },
  });
  return applications.map(toRow);
}

export async function updateApplicationStatus(
  id: string,
  status: "accepted" | "rejected",
  reviewedByUserId: string,
): Promise<ApplicationRow> {
  const application = await prisma.application.update({
    where: { id },
    data: { status, reviewedAt: new Date(), reviewedByUserId },
    include: WITH_RELATIONS,
  });
  return toRow(application);
}
