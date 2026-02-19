import { auth } from "@clerk/nextjs/server";
import { db } from "./db";
import { cache } from "react";

// `cache` evita múltiplos fetches do mesmo usuário no mesmo request
export const getCurrentUser = cache(async () => {
    const { userId: clerkId } = await auth();

    if (!clerkId) return null;

    const user = await db.user.findUnique({
        where: { clerkId },
        include: {
            subscription: true,
        },
    });

    return user;
});

// Helper para verificar plano
export const getUserPlan = cache(async () => {
    const user = await getCurrentUser();
    if (!user) return "free";

    const sub = user.subscription;
    if (!sub || sub.status !== "active") return "free";

    // Verifica se a assinatura não expirou
    if (new Date() > sub.stripeCurrentPeriodEnd) return "free";

    return sub.plan as "free" | "pro" | "team";
});
