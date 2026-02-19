# 💳 Parte 3: Checkout e Monetização com Stripe

> **Stack:** Stripe SDK + Next.js API Routes + Prisma + Webhook Handler

---

## 📦 3.1 Instalação

```bash
npm install stripe @stripe/stripe-js
```

### `.env.local`
```env
# ===== STRIPE =====
STRIPE_SECRET_KEY=sk_test_xxx               # Chave secreta (nunca exponha!)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx  # Chave pública (frontend)
STRIPE_WEBHOOK_SECRET=whsec_xxx             # Gerado ao criar o webhook

# IDs dos preços (criados no Dashboard do Stripe)
STRIPE_PRO_PRICE_ID=price_xxx
STRIPE_TEAM_PRICE_ID=price_xxx

# URL da aplicação
NEXT_PUBLIC_APP_URL=http://localhost:3000   # Em produção: https://seudominio.com
```

---

## 🎛️ 3.2 Criação de Produtos no Stripe Dashboard

1. Acesse [dashboard.stripe.com/products](https://dashboard.stripe.com/products)
2. Crie dois produtos:

| Produto | Nome | Preço | Periodicidade | Metadata |
| :--- | :---: | :---: | :---: | :--- |
| **Pro Creator** | Pro Creator | $12 | Mensal | `plan=pro` |
| **Team Business** | Team Business | $25/usuário | Mensal | `plan=team` |

3. Copie os **Price IDs** (ex: `price_1abc...`) para o `.env.local`

---

## 🛠️ 3.3 Lib: Cliente Stripe Singleton

### `src/lib/stripe.ts`

```typescript
import Stripe from "stripe";

// Singleton para evitar múltiplas instâncias
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia",
  typescript: true,
});

// Mapeia Price ID → nome do plano
export const PLAN_BY_PRICE_ID: Record<string, string> = {
  [process.env.STRIPE_PRO_PRICE_ID!]: "pro",
  [process.env.STRIPE_TEAM_PRICE_ID!]: "team",
};
```

---

## 🛒 3.4 API Route: Criar Checkout Session

### `src/app/api/stripe/checkout/route.ts`

```typescript
import { stripe } from "@/lib/stripe";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  priceId: z.string(),
});

export async function POST(req: Request) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const user = await db.user.findUnique({ where: { clerkId } });
  if (!user) return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });

  const { priceId } = schema.parse(await req.json());
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
}
```

---

## 🪝 3.5 Webhook Handler (O Mais Crítico!)

O webhook é acionado pelo Stripe quando eventos ocorrem (pagamento confirmado, cancelamento, etc.)

### `src/app/api/webhooks/stripe/route.ts`

```typescript
import { stripe } from "@/lib/stripe";
import { PLAN_BY_PRICE_ID } from "@/lib/stripe";
import { db } from "@/lib/db";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import type Stripe from "stripe";

// CRÍTICO: Desabilitar o body parser para verificar a assinatura
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
    const user = await db.user.findUnique({ where: { stripeCustomerId: customer.id } });
    targetUserId = user?.id;
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
  const body = await req.text();
  const signature = headers().get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook inválido:", err);
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
```

---

## 🌀 3.6 Portal do Assinante (Gerenciar Assinatura)

Permite que o usuário atualize o cartão, faça downgrade ou cancele, **sem você precisar construir nada**.

### `src/app/api/stripe/portal/route.ts`

```typescript
import { stripe } from "@/lib/stripe";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST() {
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
}
```

### Botão no Frontend

```typescript
async function handleManageSubscription() {
  const res = await fetch("/api/stripe/portal", { method: "POST" });
  const { url } = await res.json();
  window.location.href = url;
}

// JSX:
<button onClick={handleManageSubscription} className="btn-primary">
  Gerenciar Assinatura
</button>
```

---

## 💰 3.7 Lógica de Planos — Comparativo

| Recurso | Free | Pro ($12/mês) | Team ($25/user) |
| :--- | :---: | :---: | :---: |
| Editor WYSIWYG | ✅ | ✅ | ✅ |
| Exportação PDF/TXT | ✅ | ✅ | ✅ |
| Rascunhos (local) | ✅ 10 rascunhos | ✅ Ilimitado | ✅ Ilimitado |
| Modo Fonte (CodeMirror) | ✅ | ✅ + Prettier | ✅ + API Access |
| **IA: Reescrita de Tom** | 5×/dia | ✅ Ilimitado | ✅ |
| **IA: Tradução Neural** | ❌ | ✅ | ✅ |
| **IA: Análise SEO** | ❌ | ✅ | ✅ |
| **IA: Transcrição de Áudio** | ❌ | ✅ | ✅ |
| Sync em Nuvem | ❌ | ✅ | ✅ |
| Colaboração em Tempo Real | ❌ | ❌ | ✅ |
| Suporte | Comunidade | Prioritário | Gerente de Contas |

---

## 📄 3.8 Página de Preços (Componente)

### `src/app/pricing/page.tsx`

```typescript
import { getUserPlan } from "@/lib/auth";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "para sempre",
    description: "Editor completo, sem login. Seus dados ficam no seu dispositivo.",
    features: ["Editor WYSIWYG completo", "Exportação PDF/TXT/DOCX", "Modo Fonte (HTML)", "10 rascunhos locais", "5 usos de IA por dia"],
    cta: "Usar gratuitamente",
    priceId: null,
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$12",
    period: "por mês",
    description: "Para criadores de conteúdo sérios que precisam de IA e Cloud.",
    features: ["Tudo do Free", "IA Ilimitada (Reescrita, Tradução, SEO)", "Transcrição de áudio", "Sync em nuvem (Cross-device)", "Histórico de versões", "Suporte prioritário"],
    cta: "Começar Pro",
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID,
    highlighted: true,
  },
];

export default async function PricingPage() {
  const currentPlan = await getUserPlan();

  async function handleCheckout(priceId: string) {
    "use server";
    // Server Action para criar checkout
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/stripe/checkout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ priceId }),
    });
    const { url } = await res.json();
    return url;
  }

  return (
    <div className="min-h-screen bg-gray-950 py-20 px-4">
      <div className="max-w-5xl mx-auto text-center">
        <h1 className="text-4xl font-bold text-white mb-4">Planos e Preços</h1>
        <p className="text-gray-400 mb-12">Comece grátis. Faça upgrade quando precisar de mais poder.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl p-8 border text-left ${
                plan.highlighted
                  ? "border-indigo-500 bg-indigo-500/10 relative"
                  : "border-gray-800 bg-gray-900"
              }`}
            >
              {plan.highlighted && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                  MAIS POPULAR
                </span>
              )}
              <h2 className="text-xl font-bold text-white">{plan.name}</h2>
              <div className="mt-2 mb-4">
                <span className="text-4xl font-extrabold text-white">{plan.price}</span>
                <span className="text-gray-400 ml-1">/{plan.period}</span>
              </div>
              <p className="text-gray-400 text-sm mb-6">{plan.description}</p>
              <ul className="space-y-2.5 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-300">
                    <span className="text-green-400">✓</span> {f}
                  </li>
                ))}
              </ul>
              {plan.priceId ? (
                <form action={handleCheckout.bind(null, plan.priceId)}>
                  <button
                    type="submit"
                    disabled={currentPlan === "pro"}
                    className={`w-full py-3 rounded-xl font-semibold text-sm transition ${
                      currentPlan === "pro"
                        ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                        : "bg-indigo-600 hover:bg-indigo-700 text-white"
                    }`}
                  >
                    {currentPlan === "pro" ? "✓ Plano Atual" : plan.cta}
                  </button>
                </form>
              ) : (
                <a href="/editor" className="block w-full py-3 rounded-xl font-semibold text-sm bg-gray-800 hover:bg-gray-700 text-white text-center transition">
                  {plan.cta}
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

---

## ✅ Checklist de Stripe

- [ ] Criar conta em [stripe.com](https://stripe.com) e ativar modo teste
- [ ] Criar produtos Pro e Team no Dashboard
- [ ] Copiar Price IDs para `.env.local`
- [ ] Criar webhook no Dashboard: `https://seudominio.com/api/webhooks/stripe`
  - Eventos: `customer.subscription.*`, `invoice.payment_failed`, `checkout.session.completed`
- [ ] Copiar `STRIPE_WEBHOOK_SECRET` para `.env.local`
- [ ] Testar webhook localmente com Stripe CLI:

```bash
# Instalar Stripe CLI
brew install stripe/stripe-cli/stripe

# Login e escutar eventos localmente
stripe login
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Em outro terminal, disparar evento de teste:
stripe trigger checkout.session.completed
```

- [ ] Testar checkout completo com cartão de teste: `4242 4242 4242 4242`
- [ ] Verificar se a Subscription foi criada no banco de dados (`npx prisma studio`)
- [ ] Testar Portal do Assinante (link "Gerenciar Assinatura")
- [ ] Configurar Billing Portal no Dashboard do Stripe → Settings → Billing → Customer Portal
