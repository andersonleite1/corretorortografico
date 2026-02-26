import { currentUser } from "@clerk/nextjs/server";
import { db } from "./db";

export async function syncUserWithDb() {
    let user;
    try {
        user = await currentUser();
    } catch (error) {
        console.warn("[syncUserWithDb] Clerk auth error (likely running outside middleware context):", error);
        return null;
    }

    if (!user) {
        return null;
    }

    const email = user.emailAddresses[0]?.emailAddress;

    if (!email) {
        return null;
    }

    // Verificar se o usuário já existe
    const existingUser = await db.user.findUnique({
        where: { clerkId: user.id },
    });

    if (existingUser) {
        return existingUser;
    }

    // Criar o usuário se não existir (Fallback para quando o webhook falha ou atrasa)
    const newUser = await db.user.create({
        data: {
            clerkId: user.id,
            email,
            name: [user.firstName, user.lastName].filter(Boolean).join(" ") || null,
            imageUrl: user.imageUrl || null,
        },
    });

    console.log(`✅ [Fallback] Usuário sincronizado no DB: ${email}`);
    return newUser;
}
