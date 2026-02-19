import { stripe } from "@/lib/stripe";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST() {
    try {
        const { userId: clerkId } = await auth();
        if (!clerkId) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

        const user = await db.user.findUnique({ where: { clerkId } });

        if (!user?.stripeCustomerId) {
            return NextResponse.json({ error: "Nenhuma assinatura ativa." }, { status: 404 });
        }

        const session = await stripe.billingPortal.sessions.create({
            customer: user.stripeCustomerId,
            return_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings?tab=subscription`,
        });

        return NextResponse.json({ url: session.url });
    } catch (error) {
        console.error("[STRIPE_PORTAL_ERROR]", error);
        return NextResponse.json({ error: "Erro interno do servidor." }, { status: 500 });
    }
}
