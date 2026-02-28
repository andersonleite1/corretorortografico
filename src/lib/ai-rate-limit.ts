import { db } from "./db";

// Limite Global de IA: 5 por dia no Free, 500 por mês no Pro
const PLAN_LIMITS = { free: 5, pro: 500, team: 500 } as const;

export async function checkAiRateLimit(userId: string, plan: string) {
  const limit = PLAN_LIMITS[plan as keyof typeof PLAN_LIMITS] ?? 5;

  // Se o plano não for encontrado em PLAN_LIMITS ou for um valor inesperado que a gente decida dar Infinity
  if (limit === Infinity)
    return { allowed: true, used: 0, limit: -1, remaining: -1 };

  const now = new Date();
  let since = new Date();

  if (plan === "free") {
    // Daily reset para Free
    since.setHours(0, 0, 0, 0);
  } else {
    // Monthly reset para Pro/Team
    since = new Date(now.getFullYear(), now.getMonth(), 1);
  }

  // Contagem global agregada de todos os features (rewrite, translate, seo) desde o marco (`since`)
  const used = await db.aiUsage.count({
    where: { userId, createdAt: { gte: since } },
  });

  return {
    allowed: used < limit,
    used,
    limit,
    remaining: Math.max(0, limit - used),
  };
}
