import { db } from "./db";

const PLAN_LIMITS = { free: 5, pro: Infinity, team: Infinity } as const;

export async function checkAiRateLimit(userId: string, plan: string) {
    const limit = PLAN_LIMITS[plan as keyof typeof PLAN_LIMITS] ?? 5;

    if (limit === Infinity) return { allowed: true, used: 0, limit: -1, remaining: -1 };

    const since = new Date();
    since.setHours(0, 0, 0, 0); // Reseta à meia-noite

    const used = await db.aiUsage.count({
        where: { userId, createdAt: { gte: since } },
    });

    return { allowed: used < limit, used, limit, remaining: Math.max(0, limit - used) };
}
