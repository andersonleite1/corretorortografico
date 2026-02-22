import { stripe } from "@/lib/stripe";
import { PLAN_BY_PRICE_ID } from "@/lib/stripe";
import { db } from "@/lib/db";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import type Stripe from "stripe";

// CRÍTICO: Desabilitar o body parser para verificar a assinatura (Next.js automatically does this for API routes with `req.text()`)
export const runtime = "nodejs";

async function handleSubscriptionUpsert(
    subscription: Stripe.Subscription,
    userId?: string
) {
    const priceId = subscription.items.data[0]?.price.id;
    const plan = PLAN_BY_PRICE_ID[priceId] ?? "free";

    const data = {
        stripeSubscriptionId: subscription.id,
        stripePriceId: priceId,
        stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
        status: subscription.status,
        plan,
    };

    // Buscar userId via metadata da subscription ou do Customer
    let targetUserId = userId;
    if (!targetUserId) {
        const customer = await stripe.customers.retrieve(subscription.customer as string) as Stripe.Customer;
        // @ts-ignore - metadata isn't always typed as we expect but we set it
        targetUserId = customer.metadata?.userId;

        if (!targetUserId) {
            const user = await db.user.findUnique({ where: { stripeCustomerId: customer.id } });
            targetUserId = user?.id;
        }
    }

    if (!targetUserId) {
        console.error("userId não encontrado para subscription:", subscription.id);
        return;
    }

    await db.subscription.upsert({
        where: { userId: targetUserId },
        create: { userId: targetUserId, ...data },
        update: data,
    });

    console.log(`✅ Subscription atualizada: userId=${targetUserId}, plano=${plan}`);
}

export async function POST(req: Request) {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
        console.error("STRIPE_WEBHOOK_SECRET is not set");
        return new NextResponse("Configuração do servidor ausente.", { status: 500 });
    }

    const body = await req.text();
    const signature = (await headers()).get("stripe-signature");

    if (!signature) {
        console.error('Missing stripe-signature header');
        return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
    }

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            webhookSecret
        );
    } catch (err: any) {
        console.error("Webhook inválido:", err.message);
        return new NextResponse("Webhook inválido.", { status: 400 });
    }

    // ===== Tratar eventos =====
    switch (event.type) {
        // ✅ Assinatura criada ou atualizada
        case "customer.subscription.created":
        case "customer.subscription.updated": {
            const sub = event.data.object as Stripe.Subscription;
            const userId = sub.metadata?.userId;
            await handleSubscriptionUpsert(sub, userId);
            break;
        }

        // ❌ Assinatura cancelada
        case "customer.subscription.deleted": {
            const sub = event.data.object as Stripe.Subscription;
            await db.subscription.updateMany({
                where: { stripeSubscriptionId: sub.id },
                data: { status: "canceled", plan: "free" },
            });
            console.log(`🗑️ Subscription cancelada: ${sub.id}`);
            break;
        }

        // ⚠️ Pagamento falhou
        case "invoice.payment_failed": {
            const invoice = event.data.object as Stripe.Invoice;
            const subId = invoice.subscription as string;
            await db.subscription.updateMany({
                where: { stripeSubscriptionId: subId },
                data: { status: "past_due" },
            });
            // TODO: Enviar email de alerta ao usuário
            break;
        }

        // 🛒 Checkout concluído — garante criação da subscription
        case "checkout.session.completed": {
            const session = event.data.object as Stripe.CheckoutSession;
            if (session.mode === "subscription" && session.subscription) {
                const sub = await stripe.subscriptions.retrieve(session.subscription as string);
                await handleSubscriptionUpsert(sub, session.metadata?.userId);
            }
            break;
        }

        default:
            console.log(`Evento Stripe não tratado: ${event.type}`);
    }

    return new NextResponse("OK", { status: 200 });
}
