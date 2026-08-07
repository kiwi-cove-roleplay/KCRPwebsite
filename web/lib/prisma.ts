import { PrismaClient } from "@prisma/client";

// Standard Next.js hot-reload-safe singleton - without this, every dev-mode
// module reload would open a fresh pool of connections against DATABASE_URL.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
