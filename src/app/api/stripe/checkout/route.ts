import { stripe } from "@/lib/stripe";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
    priceId: z.string(),
});

export async function POST(req: Request) {
    try {
        const { userId: clerkId } = await auth();
        if (!clerkId) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

        const user = await db.user.findUnique({ where: { clerkId } });
        if (!user) return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });

        const body = await req.json();
        const { priceId } = schema.parse(body);
        const appUrl = process.env.NEXT_PUBLIC_APP_URL!;

        // Reutilizar stripeCustomerId existente ou criar novo
        let customerId = user.stripeCustomerId;

        if (!customerId) {
            const customer = await stripe.customers.create({
                email: user.email,
                name: user.name ?? undefined,
                metadata: { userId: user.id, clerkId },
            });
            customerId = customer.id;

            await db.user.update({
                where: { id: user.id },
                data: { stripeCustomerId: customerId },
            });
        }

        // Criar Checkout Session
        const session = await stripe.checkout.sessions.create({
            customer: customerId,
            line_items: [{ price: priceId, quantity: 1 }],
            mode: "subscription",
            success_url: `${appUrl}/settings?tab=subscription&success=true`,
            cancel_url: `${appUrl}/pricing?canceled=true`,
            subscription_data: {
                metadata: { userId: user.id }, // Para identificar no webhook
            },
            allow_promotion_codes: true, // Permite cupons de desconto
            billing_address_collection: "required",
            metadata: { userId: user.id },
        });

        return NextResponse.json({ url: session.url });
    } catch (error) {
        console.error("[STRIPE_CHECKOUT_ERROR]", error);
        return NextResponse.json({ error: "Erro interno do servidor." }, { status: 500 });
    }
}
