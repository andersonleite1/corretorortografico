import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { getUserPlan } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SettingsContent } from "./SettingsContent";
import { getCommonMessages } from "@/data/common";
import { type Locale } from "../../../../i18n-config";

export default async function SettingsPage({
  params: { locale },
}: {
  params: { locale: Locale };
}) {
  const { userId: clerkId } = await auth();
  if (!clerkId) redirect("/sign-in");

  const user = await db.user.findUnique({
    where: { clerkId },
    include: { subscription: true },
  });

  if (!user) redirect("/");

  const plan = await getUserPlan();
  const t = getCommonMessages(locale).settings;

  return (
    <div className="min-h-screen bg-gray-950 py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">{t.title}</h1>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
          <SettingsContent user={user} plan={plan} />
        </div>
      </div>
    </div>
  );
}
