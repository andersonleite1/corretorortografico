# 🔐 Parte 1: Autenticação & Gestão de Usuários

> **Stack:** Clerk (Auth) + Prisma ORM + PostgreSQL (Neon/Supabase) + Next.js 14 App Router

---

## Por que Clerk em vez de NextAuth.js?

| Critério           | NextAuth.js         | Clerk (Recomendado)      |
| :----------------- | :------------------ | :----------------------- |
| Setup              | ~2-4 horas          | ~30 minutos              |
| UI pronta          | ❌ (manual)         | ✅ Componentes embutidos |
| Magic Link         | Configuração manual | ✅ Nativo                |
| MFA                | Manual              | ✅ Nativo                |
| Webhooks           | Manual              | ✅ Dashboard             |
| Gestão de Usuários | Manual              | ✅ Dashboard completo    |
| Custo              | Grátis              | Grátis até 10k MAU       |

> Para um SaaS com foco em time-to-market, Clerk é superior. Para controle total, use NextAuth.js.

---

## 📦 1.1 Instalação e Configuração Inicial

### Passo 1: Instalar dependências

```bash
# Clerk para auth + Prisma para ORM
npm install @clerk/nextjs @prisma/client
npm install -D prisma

# Inicializar Prisma
npx prisma init --datasource-provider postgresql
```

### Passo 2: Variáveis de Ambiente (`.env.local`)

```env
# ===== CLERK =====
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx
CLERK_SECRET_KEY=sk_test_xxx

# URLs de redirecionamento após login/logout
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/editor
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding

# ===== DATABASE =====
# Use Neon (https://neon.tech) para PostgreSQL serverless grátis
DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"
```

---

## 🗂️ 1.2 Schema do Banco de Dados (Prisma)

Crie o arquivo `prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  // Para Neon serverless (recomendado):
  directUrl = env("DIRECT_URL")
}

// ==============================
// MODELO DE USUÁRIO PRINCIPAL
// ==============================
model User {
  id        String   @id @default(cuid())
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Clerk ID — sempre presente
  clerkId   String   @unique

  // Dados básicos (sincronizados via Webhook do Clerk)
  email     String   @unique
  name      String?
  imageUrl  String?

  // ===== STRIPE =====
  // ID do customer no Stripe (criado no primeiro checkout)
  stripeCustomerId String? @unique

  // ===== ASSINATURA =====
  subscription Subscription?

  // ===== CONTEÚDO =====
  documents Document[]
  aiUsage   AiUsage[]

  @@map("users")
}

// ==============================
// ASSINATURA (1-para-1 com User)
// ==============================
model Subscription {
  id        String   @id @default(cuid())
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  userId    String   @unique
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  // Dados do Stripe
  stripeSubscriptionId String   @unique
  stripePriceId        String   // ID do plano no Stripe
  stripeCurrentPeriodEnd DateTime // Quando expira o período pago

  // Status atual da assinatura
  // Valores possíveis: 'active' | 'canceled' | 'past_due' | 'trialing'
  status String @default("active")

  // Plano atual: 'free' | 'pro' | 'team'
  plan   String @default("free")

  @@map("subscriptions")
}

// ==============================
// DOCUMENTOS (Sync na Nuvem — Pro)
// ==============================
model Document {
  id        String   @id @default(cuid())
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  userId String
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)

  title   String  @default("Sem título")
  content String  @db.Text // HTML do Tiptap
  slug    String? @unique  // Para compartilhamento público

  isPublished Boolean @default(false)

  @@index([userId])
  @@map("documents")
}

// ==============================
// CONSUMO DE IA (Rate Limiting)
// ==============================
model AiUsage {
  id        String   @id @default(cuid())
  createdAt DateTime @default(now())

  userId String
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)

  // Tipo de uso: 'rewrite' | 'translate' | 'seo' | 'ghostwriter'
  feature String

  // Tokens consumidos nessa chamada
  tokensUsed Int @default(0)

  @@index([userId, createdAt])
  @@map("ai_usage")
}
```

### Comandos Prisma

```bash
# Criar/atualizar o banco com o schema
npx prisma db push

# Gerar o Prisma Client
npx prisma generate

# Ver o banco no browser (ótimo para debug)
npx prisma studio
```

---

## ⚙️ 1.3 Configuração do Clerk no Next.js

### `src/middleware.ts` (substituir o existente)

```typescript
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Rotas que requerem autenticação
const isProtectedRoute = createRouteMatcher([
  "/editor(.*)", // Editor principal
  "/(.*)", // Painel do usuário
  "/settings(.*)", // Configurações
  "/api/ai(.*)", // APIs de IA (verificadas também no handler)
  "/api/documents(.*)",
]);

// Rotas de auth pública
const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/webhooks(.*)", // Webhooks do Clerk/Stripe são públicos
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect(); // Redireciona para /sign-in se não autenticado
  }
});

export const config = {
  matcher: [
    // Ignora arquivos estáticos e _next
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
```

### `src/app/layout.tsx` (envolver com ClerkProvider)

```typescript
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "EditorTexto Pro",
  description: "Editor de texto profissional com IA",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider
      // Tema escuro para o modal de login
      appearance={{
        baseTheme: dark,
        variables: {
          colorPrimary: "#6366f1", // Indigo — adapte à sua paleta
        },
      }}
    >
      <html lang="pt-BR">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
```

---

## 🔗 1.4 Webhook do Clerk → Banco de Dados

Quando um usuário se cadastra no Clerk, precisamos criar um registro no nosso banco.

### Instalar verificação de webhook

```bash
npm install svix
```

### `src/app/api/webhooks/clerk/route.ts`

```typescript
import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { db } from "@/lib/db"; // Nosso cliente Prisma
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const CLERK_WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!CLERK_WEBHOOK_SECRET) {
    throw new Error("CLERK_WEBHOOK_SECRET não configurado.");
  }

  // Verificar autenticidade do webhook via cabeçalhos
  const headerPayload = headers();
  const svixId = headerPayload.get("svix-id");
  const svixTimestamp = headerPayload.get("svix-timestamp");
  const svixSignature = headerPayload.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return new NextResponse("Cabeçalhos de webhook ausentes.", { status: 400 });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(CLERK_WEBHOOK_SECRET);
  let event: WebhookEvent;

  try {
    event = wh.verify(body, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Erro ao verificar webhook:", err);
    return new NextResponse("Webhook inválido.", { status: 400 });
  }

  const { type, data } = event;

  // ===== EVENTO: Usuário criado =====
  if (type === "user.created") {
    const { id, email_addresses, first_name, last_name, image_url } = data;
    const email = email_addresses[0]?.email_address;

    if (!email) {
      return new NextResponse("Email não encontrado.", { status: 400 });
    }

    await db.user.create({
      data: {
        clerkId: id,
        email,
        name: [first_name, last_name].filter(Boolean).join(" ") || null,
        imageUrl: image_url || null,
      },
    });

    console.log(`✅ Usuário criado no DB: ${email}`);
  }

  // ===== EVENTO: Usuário atualizado =====
  if (type === "user.updated") {
    const { id, email_addresses, first_name, last_name, image_url } = data;
    const email = email_addresses[0]?.email_address;

    await db.user.update({
      where: { clerkId: id },
      data: {
        email: email || undefined,
        name: [first_name, last_name].filter(Boolean).join(" ") || null,
        imageUrl: image_url || null,
      },
    });
  }

  // ===== EVENTO: Usuário deletado =====
  if (type === "user.deleted") {
    const { id } = data;
    await db.user.delete({ where: { clerkId: id as string } });
    console.log(`🗑️ Usuário deletado do DB: clerkId=${id}`);
  }

  return new NextResponse("OK", { status: 200 });
}
```

---

## 🛠️ 1.5 Lib: Cliente Prisma Singleton

### `src/lib/db.ts`

```typescript
import { PrismaClient } from "@prisma/client";

// Evita múltiplas instâncias do Prisma Client em desenvolvimento (hot reload)
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
```

---

## 👤 1.6 Helper: Buscar Usuário Atual com Plano

### `src/lib/auth.ts`

```typescript
import { auth } from "@clerk/nextjs/server";
import { db } from "./db";
import { cache } from "react";

// `cache` evita múltiplos fetches do mesmo usuário no mesmo request
export const getCurrentUser = cache(async () => {
  const { userId: clerkId } = await auth();

  if (!clerkId) return null;

  const user = await db.user.findUnique({
    where: { clerkId },
    include: {
      subscription: true,
    },
  });

  return user;
});

// Helper para verificar plano
export const getUserPlan = cache(async () => {
  const user = await getCurrentUser();
  if (!user) return "free";

  const sub = user.subscription;
  if (!sub || sub.status !== "active") return "free";

  // Verifica se a assinatura não expirou
  if (new Date() > sub.stripeCurrentPeriodEnd) return "free";

  return sub.plan as "free" | "pro" | "team";
});
```

---

## 🎨 1.7 Componentes de UI de Auth

### `src/app/(auth)/sign-in/[[...sign-in]]/page.tsx`

```typescript
import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950">
      <SignIn
        appearance={{
          elements: {
            formButtonPrimary: "bg-indigo-600 hover:bg-indigo-700",
            card: "bg-gray-900 border border-gray-800",
          },
        }}
      />
    </div>
  );
}
```

### `src/app/(auth)/sign-up/[[...sign-up]]/page.tsx`

```typescript
import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950">
      <SignUp
        appearance={{
          elements: {
            formButtonPrimary: "bg-indigo-600 hover:bg-indigo-700",
            card: "bg-gray-900 border border-gray-800",
          },
        }}
      />
    </div>
  );
}
```

### Botão de Usuário no Header (`src/components/shared/UserButton.tsx`)

```typescript
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
```

---

## ✅ Checklist de Auth

- [ ] Criar conta em [clerk.com](https://clerk.com) e novo Application
- [ ] Habilitar providers: Google OAuth, Apple OAuth, Email Magic Link
- [ ] Copiar chaves para `.env.local`
- [ ] Configurar Webhook no Dashboard do Clerk → `https://seudominio.com/api/webhooks/clerk`
- [ ] Adicionar variável `CLERK_WEBHOOK_SECRET` no `.env.local`
- [ ] Rodar `npx prisma db push` e `npx prisma generate`
- [ ] Testar fluxo completo: cadastro → webhook → usuário no DB
