import { UserButton as ClerkUserButton } from "@clerk/nextjs";
import Link from "next/link";
import { getUserPlan } from "@/lib/auth";

export async function UserButton() {
    const plan = await getUserPlan();

    return (
        <div className="flex items-center gap-3">
            {plan === "free" && (
                <Link
                    href="/pricing"
                    className="text-xs font-semibold bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-3 py-1.5 rounded-full hover:opacity-90 transition"
                >
                    ⚡ Upgrade para Pro
                </Link>
            )}
            {plan === "pro" && (
                <span className="text-xs font-semibold text-indigo-400 border border-indigo-500/30 px-2 py-1 rounded-full">
                    PRO
                </span>
            )}
            <ClerkUserButton
                afterSignOutUrl="/"
                appearance={{
                    elements: {
                        avatarBox: "w-9 h-9",
                    },
                }}
            />
        </div>
    );
}
