import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { checkAiRateLimit } from "@/lib/ai-rate-limit";
import { sanitizeAiInput } from "@/lib/ai-sanitize";
import { ratelimit } from "@/lib/ratelimit";

function logError(msg: string) {
  console.error(`[AI_REWRITE_ERROR] ${msg}`);
}

export const runtime = "nodejs"; // Prisma padrão requer Node.js
export const dynamic = "force-dynamic";

const schema = z.object({
  text: z.string().min(1).max(5000),
  tone: z.union([
    z.enum([
      "professional",
      "casual",
      "concise",
      "expanded",
      "creative",
      "prompt",
    ]), // Mantendo compatibilidade se necessário
    z.string(), // Permitir qualquer string de tom (incluindo os novos 14 e customizados)
  ]),
  // SEG-03: limita e sanitiza instruções customizadas para prevenir prompt injection
  customInstructions: z.string().max(500).optional(),
  language: z.string().default("pt-BR"),
});

const TONE_PROMPTS = {
  professional: "de forma profissional, clara e objetiva",
  casual: "de forma casual e descontraída",
  concise: "de forma concisa, removendo redundâncias",
  expanded: "de forma expandida, com mais contexto e exemplos",
  creative: "de forma criativa, com metáforas e linguagem cativante",
  prompt:
    "de forma estruturada e descritiva, sendo o mais eficiente possível para ser usado como prompt ou lista de execução de ações por um agente de IA (LLM). Transforme o texto fornecido em instruções claras, diretas, livres de ambiguidades e orientadas à ação",
  // Novos 14 tons padrão
  formal: "de forma formal, profissional e polida",
  academic: "de forma acadêmica, erudita e bem estruturada",
  simplified: "de forma simples, direta e fácil de entender",
  romantic: "de forma romântica, emotiva e apaixonada",
  narrative:
    "de forma narrativa, como se estivesse contando uma história envolvente",
  instagram:
    "em estilo de post para Instagram, visual, envolvente e com bom uso de emojis",
  whatsapp:
    "em estilo de mensagem de WhatsApp, direto, conversacional e prático",
  tweet: "em estilo de Tweet, de forma concisa, impactante e curta",
  persuasive:
    "de forma persuasiva, convincente e focada em conversão/argumentação",
  friendly: "de forma amigável, acolhedora, gentil e positiva",
};

export async function POST(req: Request) {
  try {
    // SEG-01/04: Rate limit global por IP (Prevenção de Abuso)
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      "unknown";

    const globalLimit = await ratelimit.ai.limit(ip);
    if (!globalLimit.success) {
      return NextResponse.json(
        { error: "Muitas requisições de IA. Tente novamente mais tarde." },
        { status: 429 },
      );
    }

    // 1. Autenticação
    const { userId: clerkId } = await auth();
    if (!clerkId)
      return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

    // 2. Buscar usuário e plano
    const user = await db.user.findUnique({
      where: { clerkId },
      include: { subscription: true },
    });
    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado." },
        { status: 404 },
      );
    }

    // 3. Rate Limiting
    const rateLimit = await checkAiRateLimit(
      user.id,
      user.subscription?.plan ?? "free",
    );
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: "Limite de uso gratuito atingido.",
          message: `${rateLimit.used}/${rateLimit.limit} usos hoje. Faça upgrade para Pro.`,
          upgradeUrl: "/pricing",
        },
        { status: 429 },
      );
    }

    // 4. Validar input
    const body = await req.json();
    const { text, tone, customInstructions, language } = schema.parse(body);

    // Determinar o prompt de estilo
    const stylePrompt =
      TONE_PROMPTS[tone as keyof typeof TONE_PROMPTS] ||
      "mantendo o sentido original";

    // Se houver instruções customizadas, sanitizar antes de usar no prompt (SEG-03)
    const sanitizedInstructions = customInstructions
      ? sanitizeAiInput(customInstructions)
      : null;

    const extraPrompt = sanitizedInstructions
      ? `\nInstruções específicas do usuário a seguir: ${sanitizedInstructions}`
      : `\nEstilo solicitado: ${stylePrompt}`;

    // 5. Chamada IA com streaming
    const startTime = Date.now();
    const wordCount = text.trim().split(/\s+/).filter(Boolean).length;

    const result = await streamText({
      model: openai(process.env.AI_MODEL ?? "gpt-4o-mini"),
      system:
        "Você é um assistente de escrita. Sua tarefa é reescrever o texto fornecido pelo usuário, mantendo o sentido original, mas ajustando o tom conforme solicitado. Retorne APENAS o texto reescrito, sem comentários, explicações ou aspas.",
      messages: [
        {
          role: "user",
          content: `Reescreva o texto abaixo no idioma: ${language}.${extraPrompt}\n\nTexto original:\n${text}`,
        },
      ],
      onFinish: async ({ usage }) => {
        try {
          const processingTimeMs = Date.now() - startTime;
          await db.aiUsage.create({
            data: {
              userId: user.id,
              feature: "rewrite",
              tokensUsed: usage.totalTokens,
              wordCount,
              processingTimeMs,
              toneUsed: tone,
            },
          });
        } catch (e: unknown) {
          if (e instanceof Error) {
            logError(`Usage record error: ${e.message}`);
          }
        }
      },
    });

    return result.toTextStreamResponse();
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Dados inválidos.", details: error.issues },
        { status: 400 },
      );
    }

    if (error instanceof Error) {
      logError(`${error.message}\n${error.stack}`);
    }
    return NextResponse.json(
      {
        error: "Erro interno no servidor",
      },
      { status: 500 },
    );
  }
}
