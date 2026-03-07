import { NextResponse } from "next/server";
import { getUserPlan } from "@/lib/auth";

export async function GET() {
    try {
        const plan = await getUserPlan();
        return NextResponse.json({ plan });
    } catch (error) {
        console.error("[API User Plan] Error:", error);
        return NextResponse.json({ plan: "free" }, { status: 500 });
    }
}
