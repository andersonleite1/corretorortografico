import { db } from "@/lib/db";
import { getCurrentUser, getUserPlan } from "@/lib/auth";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const AI_MONTHLY_LIMITS: Record<string, number> = {
    free: 30,
    pro: 300,
    team: 1000,
};

/** Constante: velocidade média humana de edição = 40 wpm ≈ 0.66 palavras/segundo */
const HUMAN_WORDS_PER_SECOND = 0.66;

function calcTimeSavedSeconds(wordCount: number, processingTimeMs: number): number {
    const humanTimeSeconds = wordCount / HUMAN_WORDS_PER_SECOND;
    const aiTimeSeconds = processingTimeMs / 1000;
    return Math.max(0, humanTimeSeconds - aiTimeSeconds);
}

export async function GET() {
    try {
        const user = await getCurrentUser();
        if (!user) return new NextResponse("Unauthorized", { status: 401 });

        const plan = await getUserPlan();
        const aiMonthlyLimit = AI_MONTHLY_LIMITS[plan] ?? 30;

        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const thirtyDaysAgo = new Date(now);
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        // Run all queries in parallel
        const [
            totalDocuments,
            aiUsageThisMonth,
            allAiUsage,
            recentDocuments,
            toneGroups,
            dailyRawUsage,
        ] = await Promise.all([
            db.document.count({ where: { userId: user.id } }),

            db.aiUsage.count({
                where: { userId: user.id, createdAt: { gte: startOfMonth } },
            }),

            db.aiUsage.findMany({
                where: { userId: user.id },
                select: { wordCount: true, processingTimeMs: true },
            }),

            db.document.findMany({
                where: { userId: user.id },
                orderBy: { updatedAt: "desc" },
                take: 5,
                select: { id: true, title: true, updatedAt: true },
            }),

            db.aiUsage.groupBy({
                by: ["toneUsed"],
                where: { userId: user.id, toneUsed: { not: null } },
                _count: { toneUsed: true },
                orderBy: { _count: { toneUsed: "desc" } },
                take: 5,
            }),

            db.aiUsage.findMany({
                where: { userId: user.id, createdAt: { gte: thirtyDaysAgo } },
                select: { createdAt: true, wordCount: true, processingTimeMs: true },
                orderBy: { createdAt: "asc" },
            }),
        ]);

        // Total time saved (seconds)
        const totalTimeSavedSeconds = allAiUsage.reduce((acc, row) => {
            return acc + calcTimeSavedSeconds(row.wordCount, row.processingTimeMs);
        }, 0);

        // Top tones
        const topTones = toneGroups.map((g) => ({
            tone: g.toneUsed ?? "unknown",
            count: g._count.toneUsed,
        }));

        // Daily series: group by date string (YYYY-MM-DD)
        const dailyMap: Record<string, { timeSavedSeconds: number; rewrites: number }> = {};

        for (let i = 0; i < 30; i++) {
            const d = new Date(thirtyDaysAgo);
            d.setDate(d.getDate() + i);
            const key = d.toISOString().slice(0, 10);
            dailyMap[key] = { timeSavedSeconds: 0, rewrites: 0 };
        }

        for (const row of dailyRawUsage) {
            const key = row.createdAt.toISOString().slice(0, 10);
            if (dailyMap[key] !== undefined) {
                dailyMap[key].timeSavedSeconds += calcTimeSavedSeconds(row.wordCount, row.processingTimeMs);
                dailyMap[key].rewrites += 1;
            }
        }

        const dailySeries = Object.entries(dailyMap).map(([date, val]) => ({
            date,
            timeSavedMinutes: Math.round(val.timeSavedSeconds / 60),
            rewrites: val.rewrites,
        }));

        return NextResponse.json({
            totalDocuments,
            aiUsageThisMonth,
            aiMonthlyLimit,
            plan,
            totalTimeSavedSeconds: Math.round(totalTimeSavedSeconds),
            topTones,
            recentDocuments,
            dailySeries,
        });
    } catch (error) {
        console.error("[DASHBOARD_GET]", error);
        return new NextResponse("Erro Interno", { status: 500 });
    }
}
