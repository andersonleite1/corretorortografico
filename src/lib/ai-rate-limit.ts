import { db } from "./db";

// Limite Mensal Pago de IA: 0 no Free, 500 no Pro
const PLAN_MONTHLY_LIMITS = { free: 0, pro: 500, team: 500 } as const;

export async function checkAiRateLimit(userId: string, plan: string) {
  const isFree = plan === "free";
  const monthlyPaidLimit =
    PLAN_MONTHLY_LIMITS[plan as keyof typeof PLAN_MONTHLY_LIMITS] ?? 0;
  const DAILY_FREE_LIMIT = 5;

  if (monthlyPaidLimit === Infinity) {
    return {
      allowed: true,
      usedDaily: 0,
      limitDaily: DAILY_FREE_LIMIT,
      remainingDaily: DAILY_FREE_LIMIT,
      usedMonthlyPaid: 0,
      limitMonthlyPaid: -1,
      remainingMonthlyPaid: -1,
      used: 0,
      limit: -1,
      remaining: -1,
    };
  }

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // Buscar todos os usos deste mês
  const usagesThisMonth = await db.aiUsage.findMany({
    where: { userId, createdAt: { gte: startOfMonth } },
    select: { createdAt: true },
  });

  const usageByDay: Record<string, number> = {};
  for (const usage of usagesThisMonth) {
    // Usar data local ou UTC para o dia? Usaremos UTC para simplificar
    const dayKey = usage.createdAt.toISOString().split("T")[0];
    usageByDay[dayKey] = (usageByDay[dayKey] || 0) + 1;
  }

  const todayKey = now.toISOString().split("T")[0];
  const usedToday = usageByDay[todayKey] || 0;

  let usedPaidThisMonth = 0;
  for (const count of Object.values(usageByDay)) {
    if (count > DAILY_FREE_LIMIT) {
      usedPaidThisMonth += count - DAILY_FREE_LIMIT;
    }
  }

  let allowed = false;
  if (usedToday < DAILY_FREE_LIMIT) {
    allowed = true; // Still has daily free usages
  } else if (!isFree && usedPaidThisMonth < monthlyPaidLimit) {
    allowed = true; // Still has monthly paid usages available
  }

  return {
    allowed,
    usedDaily: usedToday,
    limitDaily: DAILY_FREE_LIMIT,
    remainingDaily: Math.max(0, DAILY_FREE_LIMIT - usedToday),
    usedMonthlyPaid: usedPaidThisMonth,
    limitMonthlyPaid: monthlyPaidLimit,
    remainingMonthlyPaid: Math.max(0, monthlyPaidLimit - usedPaidThisMonth),
    // Retornamos estes campos agregados para compatibilidade com outros endpoints
    used: isFree ? usedToday : usedPaidThisMonth,
    limit: isFree ? DAILY_FREE_LIMIT : monthlyPaidLimit,
    remaining: isFree
      ? Math.max(0, DAILY_FREE_LIMIT - usedToday)
      : Math.max(0, monthlyPaidLimit - usedPaidThisMonth),
  };
}
