import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { getUserPlan } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SettingsContent } from "./SettingsContent";

export default async function SettingsPage() {
    const { userId: clerkId } = await auth();
    if (!clerkId) redirect("/sign-in");

    const user = await db.user.findUnique({
        where: { clerkId },
        include: { subscription: true },
    });

    if (!user) redirect("/");

    const plan = await getUserPlan();

    return (
        <div className="min-h-screen bg-gray-950 py-20 px-4">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-white mb-8">Configurações</h1>

                <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
                    <SettingsContent user={user} plan={plan} />
                </div>
            </div>
        </div>
    );
}
