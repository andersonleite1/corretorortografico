import { auth } from "@clerk/nextjs/server";
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
  } catch (dbError) {
    console.error("[DashboardPage] Erro ao buscar usuario:", dbError);
  }

  if (!user) redirect("/");

  return (
    <DashboardContent
      userName={user.name ?? user.email ?? "Usuário"}
      locale={params.locale as any}
    />
  );
}
