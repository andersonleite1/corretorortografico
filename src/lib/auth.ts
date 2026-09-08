import { auth } from "@clerk/nextjs/server";
import { db } from "./db";
import { cache } from "react";

// Fallback para ambientes onde o cache do React não está disponível (ex: testes unitários)
const cacheShim = typeof cache === "function" ? cache : <T extends (...args: any[]) => any>(fn: T) => fn;

// `cache` evita múltiplos fetches do mesmo usuário no mesmo request.
// Adicionamos um parâmetro opcional para permitir bypass do cache se necessário.
export const getCurrentUser = cacheShim(async (_forceRefresh: boolean = false) => {
  const { userId: clerkId } = await auth();

  if (!clerkId) return null;

  // Se forceRefresh for true, podemos passar um valor único para o cache
  // ou simplesmente confiar que quem chama com true quer dados novos do DB.
  // No React cache, a mesma função com argumentos diferentes gera entradas de cache diferentes.

  try {
    let user = await db.user.findUnique({
      where: { clerkId },
      include: {
        subscription: true,
      },
    });

    // Se o usuário não existe no DB local, tenta sincronizar on-the-fly (ESC-01)
    if (!user) {
      const { syncUserWithDb } = await import("./sync-user");
      user = (await syncUserWithDb()) as any;
    }

    return user;
  } catch (error) {
    console.error("[getCurrentUser] Error fetching user from DB:", error);
    return null;
  }
});

// Helper para verificar o plano do usuário.
export const getUserPlan = cacheShim(async (forceRefresh: boolean = false) => {
  const { userId: clerkId } = await auth();
  if (!clerkId) return "free";

  const user = await getCurrentUser(forceRefresh);
  if (!user) return "free";

  const sub = user.subscription;
  // BUG-04: Verifica explicitamente por status válidos
  const validStatuses = ["active", "trialing"];
  let plan: "free" | "pro" | "team" = "free";

  if (sub && validStatuses.includes(sub.status)) {
    // Verifica expiração manual se houver data
    const isExpired =
      sub.stripeCurrentPeriodEnd && new Date() > sub.stripeCurrentPeriodEnd;
    if (!isExpired) {
      plan = sub.plan as "free" | "pro" | "team";
    }
  }

  return plan;
});
