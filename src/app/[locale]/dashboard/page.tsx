import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Metadata } from "next";
import DashboardContent from "./DashboardContent";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Dashboard | Editor de Texto IA",
  description:
    "Visualize suas métricas de produtividade e o tempo economizado com a IA.",
};

export default async function DashboardPage({
  params,
}: {
  params: { locale: string };
}) {
  const { userId: clerkId } = await auth();
  if (!clerkId) redirect("/sign-in");

  let user = null;
  try {
    user = await db.user.findUnique({
      where: { clerkId },
      select: { id: true, name: true, email: true },
    });

    if (!user) {
      // Fallback: se o usuário não existe no Prisma (ex: Webhook falhou localmente), cria on-the-fly
      const clerkUser = await currentUser();
      if (clerkUser) {
        const email = clerkUser.emailAddresses[0]?.emailAddress;
        if (email) {
          user = await db.user.create({
            data: {
              clerkId,
              email,
              name: [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") || null,
              imageUrl: clerkUser.imageUrl || null,
              subscription: {
                create: {
                  plan: "free",
                  status: "active",
                },
              },
            },
            select: { id: true, name: true, email: true },
          });
          console.log(`[DashboardPage] Usuário criado on-the-fly: ${email}`);
        }
      }
    }
  } catch (dbError) {
    console.error("[DashboardPage] Erro ao buscar/criar usuario:", dbError);
  }

  if (!user) redirect("/");

  return (
    <DashboardContent
      userName={user.name ?? user.email ?? "Usuário"}
      locale={params.locale as any}
    />
  );
}
