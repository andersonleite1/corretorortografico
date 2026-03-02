import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { checkAiRateLimit } from "@/lib/ai-rate-limit";
import { ratelimit } from "@/lib/ratelimit";
import { sanitizeAiInput } from "@/lib/ai-sanitize";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const seoSchema = z.object({
  readabilityScore: z.number().min(0).max(100),
  readabilityLevel: z.enum([
    "Muito Fácil",
    "Fácil",
    "Médio",
    "Difícil",
    "Muito Difícil",
  ]),
  sentiment: z.enum(["Positivo", "Neutro", "Negativo"]),
  keyDensity: z.array(
    z.object({ word: z.string(), count: z.number(), percentage: z.number() }),
  ),
  suggestions: z.array(
    z.object({
      type: z.enum(["warning", "tip", "error"]),
      message: z.string(),
    }),
  ),
  seoTitle: z.string(),
  metaDescription: z.string().max(160),
});

export async function POST(req: Request) {
  try {
    // SEG-01/04: Rate limit global por IP (Prevenção de Abuso)
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";

    const globalLimit = await ratelimit.ai.limit(ip);
    if (!globalLimit.success) {
      return NextResponse.json(
        { error: "Muitas requisições de IA. Tente novamente mais tarde." },
        { status: 429 },
      );
    }

    const { userId: clerkId } = await auth();
    if (!clerkId)
      return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

    const user = await db.user.findUnique({
      where: { clerkId },
      include: { subscription: true },
    });

    // SEO é exclusivo para Pro
    if (!user?.subscription || user.subscription.plan === "free") {
      return NextResponse.json(
        { error: "SEO é exclusivo Pro+.", upgradeUrl: "/pricing" },
        { status: 403 },
      );
    }

    const rateLimit = await checkAiRateLimit(user.id, user.subscription.plan);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: "Limite atingido.",
          message: "Você atingiu seu limite de uso.",
          upgradeUrl: "#pricing",
        },
        { status: 429 },
      );
    }

    const body = await req.json();
    const { content, title } = z
      .object({
        content: z.string().min(1).max(5000),
        title: z.string().max(500).optional(),
      })
      .parse(body);

    const safeTitle = title ? sanitizeAiInput(title) : "Sem título";
    const safeContent = sanitizeAiInput(content);

    const { object, usage } = await generateObject({
      model: openai(process.env.AI_MODEL ?? "gpt-4o-mini"),
      schema: seoSchema,
      prompt: `Analise o seguinte artigo e retorne análise SEO completa.\nTítulo: ${safeTitle}\n\n${safeContent}`,
    });

    await db.aiUsage.create({
      data: { userId: user.id, feature: "seo", tokensUsed: usage.totalTokens },
    });

    return NextResponse.json(object);
  } catch (error) {
    console.error("[AI_SEO_ERROR]", error);
    return NextResponse.json(
      { error: "Erro interno no servidor." },
      { status: 500 },
    );
  }
}
