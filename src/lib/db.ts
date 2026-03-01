import { PrismaClient } from "@prisma/client";

// Evita múltiplas instâncias do Prisma Client em desenvolvimento (hot reload) - Refreshed
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
    // ESC-02: Em produção, o ideal é que o connection_limit esteja na DATABASE_URL.
    // O Prisma recomenda usar um pooler (como PgBouncer) em ambientes serverless.
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
