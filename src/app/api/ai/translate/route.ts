import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { checkAiRateLimit } from "@/lib/ai-rate-limit";

export const runtime = "nodejs";

export async function POST(req: Request) {
    try {
        const { userId: clerkId } = await auth();
        if (!clerkId) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

        const user = await db.user.findUnique({ where: { clerkId }, include: { subscription: true } });
        if (!user) return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });

        const rateLimit = await checkAiRateLimit(user.id, user.subscription?.plan ?? "free");
        if (!rateLimit.allowed) {
            return NextResponse.json({ error: "Limite atingido.", message: "Você atingiu seu limite diário.", upgradeUrl: "/pricing" }, { status: 429 });
        }

        const body = await req.json();
        const { content, to } = z.object({
            content: z.string().min(1).max(10000),
            to: z.string().min(2),
        }).parse(body);

        const result = await streamText({
            model: openai(process.env.AI_MODEL ?? "gpt-4o-mini"),
            system: "Tradutor profissional. Preserve toda a formatação HTML. Retorne APENAS o HTML traduzido.",
            messages: [{ role: "user", content: `Traduza para "${to}":\n\n${content}` }],
            onFinish: async ({ usage }) => {
                await db.aiUsage.create({ data: { userId: user.id, feature: "translate", tokensUsed: usage.totalTokens } });
            },
        });

        return result.toTextStreamResponse();
    } catch (error) {
        console.error("[AI_TRANSLATE_ERROR]", error);
        return NextResponse.json({ error: "Erro interno no servidor." }, { status: 500 });
    }
}
