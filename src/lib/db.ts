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
    // ESC-02: Configuração de pool de conexões.
    // Em ambientes serverless (Vercel), recomenda-se o uso de um pooler como Prisma Accelerate
    // ou PgBouncer, e definir ?connection_limit=X na DATABASE_URL.
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
