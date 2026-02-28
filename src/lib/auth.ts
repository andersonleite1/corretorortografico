import { auth } from "@clerk/nextjs/server";
import { db } from "./db";
import { cache } from "react";

// `cache` evita múltiplos fetches do mesmo usuário no mesmo request.
// Adicionamos um parâmetro opcional para permitir bypass do cache se necessário.
export const getCurrentUser = cache(async (_forceRefresh: boolean = false) => {
  const { userId: clerkId } = await auth();

  if (!clerkId) return null;

  // Se forceRefresh for true, podemos passar um valor único para o cache
  // ou simplesmente confiar que quem chama com true quer dados novos do DB.
  // No React cache, a mesma função com argumentos diferentes gera entradas de cache diferentes.

  const user = await db.user.findUnique({
    where: { clerkId },
    include: {
      subscription: true,
    },
  });

  return user;
});

// Helper para verificar plano
export const getUserPlan = cache(async (forceRefresh: boolean = false) => {
  const user = await getCurrentUser(forceRefresh);
  if (!user) return "free";

  const sub = user.subscription;
  if (!sub || sub.status !== "active") return "free";

  // Se tiver stripeCurrentPeriodEnd, verifica se expirou
  if (sub.stripeCurrentPeriodEnd && new Date() > sub.stripeCurrentPeriodEnd) {
    return "free";
  }

  return sub.plan as "free" | "pro" | "team";
});
