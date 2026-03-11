import { currentUser } from "@clerk/nextjs/server";
import { db } from "./db";

export async function syncUserWithDb() {
  let user;
  try {
    user = await currentUser();
  } catch (error) {
    console.warn(
      "[syncUserWithDb] Clerk auth error (likely running outside middleware context):",
      error,
    );
    return null;
  }

  if (!user) {
    return null;
  }

  const email = user.emailAddresses[0]?.emailAddress;

  if (!email) {
    return null;
  }

  try {
    // Verificar se o usuário já existe pelo Clerk ID ou Email (evita P2002)
    const existingByClerkId = await db.user.findUnique({
      where: { clerkId: user.id },
    });

    const existingByEmail = !existingByClerkId
      ? await db.user.findUnique({ where: { email } })
      : null;

    if (existingByClerkId || existingByEmail) {
      const existingUser = (existingByClerkId || existingByEmail)!;

      // Se achou por email mas o clerkId tá diferente, atualiza
      if (existingUser.clerkId !== user.id) {
        return await db.user.update({
          where: { id: existingUser.id },
          data: { clerkId: user.id },
        });
      }
      return existingUser;
    }

    // Criar o usuário se não existir (Fallback para quando o webhook falha ou atrasa)
    const newUser = await db.user.create({
      data: {
        clerkId: user.id,
        email,
        name: [user.firstName, user.lastName].filter(Boolean).join(" ") || null,
        imageUrl: user.imageUrl || null,
        subscription: {
          create: {
            plan: "free",
            status: "active",
          },
        },
      },
    });

    console.log(`✅ [Fallback] Usuário sincronizado no DB: ${email}`);
    return newUser;
  } catch (dbError) {
    console.error(
      "[syncUserWithDb] Erro ao sincronizar usuário no DB:",
      dbError,
    );
    return null;
  }
}
