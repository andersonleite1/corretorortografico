import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Metadata } from "next";
import DashboardContent from "./DashboardContent";
import { getCurrentUser } from "@/lib/auth";

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

  const user = await getCurrentUser();

  if (!user) redirect("/");

  return (
    <DashboardContent
      userName={user.name ?? user.email ?? "Usuário"}
      locale={params.locale as any}
    />
  );
}
