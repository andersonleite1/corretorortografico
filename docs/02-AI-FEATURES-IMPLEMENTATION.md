# 🤖 Parte 2: Implementação de IA (Features Pro)

> **Stack:** Vercel AI SDK + OpenAI GPT-4o + Tiptap Bubble Menu + Edge Runtime

---

## 📦 2.1 Instalação

```bash
npm install ai @ai-sdk/openai zod
```

### `.env.local`
```env
OPENAI_API_KEY=sk-proj-xxx
AI_MODEL=gpt-4o-mini
```

---

## 🧠 2.2 API Route: Reescrita com Streaming

### `src/app/api/ai/rewrite/route.ts`

```typescript
import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { checkAiRateLimit } from "@/lib/ai-rate-limit";

export const runtime = "edge"; // ⚡ Menor latência global

const schema = z.object({
  text: z.string().min(1).max(5000),
  tone: z.enum(["professional", "casual", "concise", "expanded", "creative"]),
  language: z.string().default("pt-BR"),
});

const TONE_PROMPTS = {
  professional: "de forma profissional, clara e objetiva",
  casual: "de forma casual e descontraída",
  concise: "de forma concisa, removendo redundâncias",
  expanded: "de forma expandida, com mais contexto e exemplos",
  creative: "de forma criativa, com metáforas e linguagem cativante",
};

export async function POST(req: Request) {
  // 1. Autenticação
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  // 2. Buscar usuário e plano
  const user = await db.user.findUnique({
    where: { clerkId },
    include: { subscription: true },
  });
  if (!user) return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });

  // 3. Rate Limiting
  const rateLimit = await checkAiRateLimit(user.id, user.subscription?.plan ?? "free");
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Limite de uso gratuito atingido.", message: `${rateLimit.used}/${rateLimit.limit} usos hoje. Faça upgrade para Pro.`, upgradeUrl: "/pricing" },
      { status: 429 }
    );
  }

  // 4. Validar input
  const { text, tone, language } = schema.parse(await req.json());

  // 5. Chamada IA com streaming
  const result = await streamText({
    model: openai(process.env.AI_MODEL ?? "gpt-4o-mini"),
    system: "Você é um assistente de escrita. Responda APENAS com o texto reescrito, sem explicações.",
    messages: [{
      role: "user",
      content: `Reescreva ${TONE_PROMPTS[tone]}. Idioma: ${language}.\n\nTexto:\n${text}`,
    }],
    maxTokens: 2000,
    onFinish: async ({ usage }) => {
      await db.aiUsage.create({ data: { userId: user.id, feature: "rewrite", tokensUsed: usage.totalTokens } });
    },
  });

  return result.toDataStreamResponse();
}
```

---

## 🚦 2.3 Rate Limiting por Plano

### `src/lib/ai-rate-limit.ts`

```typescript
import { db } from "./db";

const PLAN_LIMITS = { free: 5, pro: Infinity, team: Infinity } as const;

export async function checkAiRateLimit(userId: string, plan: string) {
  const limit = PLAN_LIMITS[plan as keyof typeof PLAN_LIMITS] ?? 5;

  if (limit === Infinity) return { allowed: true, used: 0, limit: -1, remaining: -1 };

  const since = new Date();
  since.setHours(0, 0, 0, 0); // Reseta à meia-noite

  const used = await db.aiUsage.count({
    where: { userId, createdAt: { gte: since } },
  });

  return { allowed: used < limit, used, limit, remaining: Math.max(0, limit - used) };
}
```

---

## ✨ 2.4 Bubble Menu no Tiptap (UI)

### `src/components/TiptapEditor/components/AiBubbleMenu.tsx`

```typescript
"use client";

import { BubbleMenu, type Editor } from "@tiptap/react";
import { useCompletion } from "ai/react";
import { useState } from "react";
import { Wand2, Loader2 } from "lucide-react";

type Tone = "professional" | "casual" | "concise" | "expanded" | "creative";

const TONES: { value: Tone; label: string }[] = [
  { value: "professional", label: "Profissional" },
  { value: "casual",       label: "Casual"        },
  { value: "concise",      label: "Conciso"        },
  { value: "expanded",     label: "Expandido"      },
  { value: "creative",     label: "Criativo"       },
];

interface Props { editor: Editor; isPro: boolean; }

export function AiBubbleMenu({ editor, isPro }: Props) {
  const [open, setOpen] = useState(false);

  const { complete, isLoading } = useCompletion({
    api: "/api/ai/rewrite",
    onFinish: (_, result) => {
      const { from, to } = editor.state.selection;
      editor.chain().focus().deleteRange({ from, to }).insertContent(result).run();
      setOpen(false);
    },
    onError: (err) => {
      try {
        const data = JSON.parse(err.message);
        if (data.upgradeUrl) alert(`${data.message}\n\nAcesse: /pricing`);
      } catch { alert("Erro na IA. Tente novamente."); }
    },
  });

  const handleRewrite = (tone: Tone) => {
    const text = editor.state.doc.textBetween(
      editor.state.selection.from,
      editor.state.selection.to, " "
    );
    if (!text.trim()) return;
    complete("", { body: { text, tone, language: "pt-BR" } });
  };

  return (
    <BubbleMenu editor={editor} shouldShow={({ state }) => state.selection.from !== state.selection.to && !isLoading}>
      <div className="relative flex items-center bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl p-1.5">
        <button
          onClick={() => isPro ? setOpen(!open) : window.location.href = "/pricing"}
          disabled={isLoading}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold ${
            isPro ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white" : "bg-gray-100 text-gray-500"
          }`}
        >
          {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5" />}
          {isPro ? "Reescrever IA ▾" : "⚡ Pro"}
        </button>

        {open && isPro && (
          <div className="absolute top-full left-0 mt-1 w-44 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl z-50 p-1">
            {TONES.map((t) => (
              <button
                key={t.value}
                onClick={() => { setOpen(false); handleRewrite(t.value); }}
                className="w-full text-left px-3 py-2 text-xs rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/30"
              >
                {t.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </BubbleMenu>
  );
}
```

### Adicionar ao TiptapEditor principal

```typescript
// Dentro do componente Editor, após o EditorContent:
<AiBubbleMenu editor={editor} isPro={userPlan === "pro"} />
```

---

## 🌍 2.5 Tradução Neural

### `src/app/api/ai/translate/route.ts`

```typescript
import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { checkAiRateLimit } from "@/lib/ai-rate-limit";

export const runtime = "edge";

export async function POST(req: Request) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const user = await db.user.findUnique({ where: { clerkId }, include: { subscription: true } });
  if (!user) return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });

  const rateLimit = await checkAiRateLimit(user.id, user.subscription?.plan ?? "free");
  if (!rateLimit.allowed) {
    return NextResponse.json({ error: "Limite atingido.", upgradeUrl: "/pricing" }, { status: 429 });
  }

  const { content, to } = z.object({
    content: z.string().min(1).max(10000),
    to: z.string().min(2),
  }).parse(await req.json());

  const result = await streamText({
    model: openai(process.env.AI_MODEL ?? "gpt-4o-mini"),
    system: "Tradutor profissional. Preserve toda a formatação HTML. Retorne APENAS o HTML traduzido.",
    messages: [{ role: "user", content: `Traduza para "${to}":\n\n${content}` }],
    maxTokens: 4000,
    onFinish: async ({ usage }) => {
      await db.aiUsage.create({ data: { userId: user.id, feature: "translate", tokensUsed: usage.totalTokens } });
    },
  });

  return result.toDataStreamResponse();
}
```

---

## 📊 2.6 Análise SEO (retorna JSON estruturado)

### `src/app/api/ai/seo/route.ts`

```typescript
import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

export const runtime = "nodejs";

const seoSchema = z.object({
  readabilityScore: z.number().min(0).max(100),
  readabilityLevel: z.enum(["Muito Fácil", "Fácil", "Médio", "Difícil", "Muito Difícil"]),
  sentiment: z.enum(["Positivo", "Neutro", "Negativo"]),
  keyDensity: z.array(z.object({ word: z.string(), count: z.number(), percentage: z.number() })),
  suggestions: z.array(z.object({ type: z.enum(["warning", "tip", "error"]), message: z.string() })),
  seoTitle: z.string(),
  metaDescription: z.string().max(160),
});

export async function POST(req: Request) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const user = await db.user.findUnique({ where: { clerkId }, include: { subscription: true } });

  // SEO é exclusivo para Pro
  if (!user?.subscription || user.subscription.plan === "free") {
    return NextResponse.json({ error: "SEO é exclusivo Pro+.", upgradeUrl: "/pricing" }, { status: 403 });
  }

  const { content, title } = await req.json();

  const { object } = await generateObject({
    model: openai("gpt-4o"),
    schema: seoSchema,
    prompt: `Analise o seguinte artigo e retorne análise SEO completa.\nTítulo: ${title ?? "Sem título"}\n\n${content}`,
  });

  await db.aiUsage.create({ data: { userId: user.id, feature: "seo", tokensUsed: 500 } });

  return NextResponse.json(object);
}
```

---

## ✅ Checklist de IA

- [ ] `npm install ai @ai-sdk/openai zod`
- [ ] Criar API Key em [platform.openai.com](https://platform.openai.com)
- [ ] Adicionar `OPENAI_API_KEY` e `AI_MODEL` ao `.env.local`
- [ ] Criar `src/lib/ai-rate-limit.ts` com lógica de limites
- [ ] Criar rota `/api/ai/rewrite/route.ts`
- [ ] Integrar `AiBubbleMenu` ao editor principal
- [ ] Testar rate limiting: fazer 5+ chamadas no plano Free
- [ ] Testar retorno de erro com `upgradeUrl` ao extrapolar o limite
