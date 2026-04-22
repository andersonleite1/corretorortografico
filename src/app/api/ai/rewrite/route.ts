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

// Sistema de prompts otimizado — cada tom possui instruções precisas de formato,
// estilo e comportamento esperado, eliminando ambiguidade e melhorando consistência.
const SYSTEM_PROMPT =
  "Você é um editor de texto profissional especializado em reescrita e adaptação de conteúdo. " +
  "Sua missão: transformar o texto do usuário ajustando exclusivamente o tom e estilo — " +
  "preservando o significado, os fatos e a intenção originais.\n\n" +
  "Regras obrigatórias:\n" +
  "1. Retorne APENAS o texto reescrito — sem prefixos, aspas envolventes ou comentários explicativos\n" +
  "2. Preserve a estrutura do documento: parágrafos, listas e títulos existentes\n" +
  "3. Mantenha o idioma do texto original, salvo instrução explícita em contrário\n" +
  "4. Se o texto tiver menos de 5 palavras, retorne-o exatamente como está\n" +
  "5. Nunca adicione informações que não existam no texto original\n" +
  "6. Comprimento da resposta: semelhante ao original, exceto quando o tom exigir diferente";

const TONE_PROMPTS = {
  // --- Tons Formais ---
  formal:
    "Reescreva em tom formal e respeitoso. Use vocabulário preciso, evite contrações e expressões coloquiais. " +
    "Frases completas e bem estruturadas. Adequado para cartas, e-mails corporativos e documentos oficiais.",

  professional:
    "Reescreva em tom profissional e direto ao ponto. Elimine ambiguidades e informalidade. " +
    "Use voz ativa, frases objetivas e vocabulário de negócios. " +
    "Adequado para relatórios, apresentações e comunicação corporativa.",

  academic:
    "Reescreva em tom acadêmico formal. Use terminologia técnica adequada ao assunto, " +
    "construção argumentativa clara (premissa → desenvolvimento → conclusão) e linguagem impessoal. " +
    "Evite jargões desnecessários e expressões coloquiais.",

  // --- Tons Criativos ---
  creative:
    "Reescreva de forma criativa e expressiva. Use metáforas, figuras de linguagem, " +
    "ritmo variado e escolhas lexicais originais que tornem o texto memorável. " +
    "Surpreenda o leitor sem perder o sentido central.",

  romantic:
    "Reescreva em tom romântico e emotivo. Use linguagem sensorial, ritmo suave e " +
    "palavras que evoquem sentimento, proximidade e emoção genuína. " +
    "Adequado para cartas, declarações e textos afetivos.",

  narrative:
    "Reescreva em estilo narrativo envolvente. Transforme o conteúdo em uma sequência com " +
    "início, desenvolvimento e desfecho implícito. Use tempo verbal consistente, " +
    "detalhes evocativos e transições fluidas entre ideias.",

  // --- Tons Digitais ---
  instagram:
    "Reescreva para Instagram. Formato obrigatório: gancho impactante na primeira linha → " +
    "corpo com 2-3 ideias curtas → encerramento com pergunta ou call-to-action. " +
    "Use 3-5 emojis posicionados estrategicamente para reforçar o contexto. " +
    "Parágrafos curtos com linha em branco entre eles. Sem hashtags.",

  whatsapp:
    "Reescreva como mensagem de WhatsApp: direta, conversacional e sem formalidade excessiva. " +
    "Frases curtas. Use abreviações naturais quando cabível. " +
    "Tom próximo e pessoal. Até 3 emojis se agregarem contexto.",

  tweet:
    "Reescreva como tweet. Limite estrito: 280 caracteres. Impactante desde a primeira palavra. " +
    "Elimine tudo que não for essencial. Sem hashtags ou @menções.",

  casual:
    "Reescreva em tom casual e descontraído. Use linguagem cotidiana, contrações naturais " +
    "e humor leve quando adequado ao contexto. Evite vocabulário rebuscado.",

  friendly:
    "Reescreva em tom amigável e acolhedor. Use 'você' diretamente, frases curtas e positivas, " +
    "e empatia implícita. Evite impessoalidade. " +
    "Crie a sensação de conversa com um amigo de confiança.",

  // --- Tons Funcionais ---
  concise:
    "Reescreva de forma concisa. Elimine: redundâncias, explicações óbvias, advérbios fracos " +
    "e construções passivas desnecessárias. Alvo: reduzir 30-50% sem perder nenhuma informação essencial.",

  expanded:
    "Reescreva de forma expandida. Adicione contexto explicativo, exemplos concretos, analogias " +
    "e transições entre ideias. Aprofunde os pontos principais sem fugir do tema. " +
    "Alvo: aumentar 50-100% mantendo coesão.",

  simplified:
    "Reescreva de forma simples e direta. Use vocabulário acessível, frases curtas (máximo 20 palavras), " +
    "voz ativa e exemplos quando ajudar a clareza. Adequado para público geral.",

  persuasive:
    "Reescreva de forma persuasiva. Estruture com: (1) gancho que cria conexão, " +
    "(2) problema claro, (3) solução apresentada como benefício, (4) chamada à ação implícita. " +
    "Use linguagem de benefício, não de característica. Persuasão honesta, sem manipulação.",

  prompt:
    "Transforme o texto em instruções claras para um agente de IA (LLM). Formato obrigatório:\n" +
    "- Objetivo: [uma frase descrevendo a tarefa]\n" +
    "- Contexto: [informações necessárias para execução]\n" +
    "- Instruções: [lista numerada com ações específicas e mensuráveis, sem ambiguidade]\n" +
    "- Restrições: [o que NÃO deve ser feito, se aplicável]\n" +
    "- Saída esperada: [formato e conteúdo do resultado]\n" +
    "Elimine linguagem vaga. Cada instrução deve ser executável de forma independente.",
};

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

    // 1. Autenticação e Sincronização de Usuário
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    }

    const { getCurrentUser } = await import("@/lib/auth");
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado." },
        { status: 404 },
      );
    }

    // 3. Rate Limiting
    const plan = user.subscription?.plan ?? "free";
    const rateLimit = await checkAiRateLimit(user.id, plan);

    if (!rateLimit.allowed) {
      if (plan === "free") {
        return NextResponse.json(
          {
            error: "Limite de uso gratuito atingido.",
            message: `${rateLimit.usedDaily}/${rateLimit.limitDaily} usos hoje. Faça upgrade para Pro para ter 500 reescritas mensais.`,
            upgradeUrl: "#pricing",
          },
          { status: 429 },
        );
      } else {
        return NextResponse.json(
          {
            error: "Limite do plano Pro atingido.",
            message: `Você já utilizou suas 5 reescritas gratuitas de hoje e também atingiu o limite de ${rateLimit.limitMonthlyPaid} reescritas do seu plano este mês.`,
            upgradeUrl: "#pricing",
          },
          { status: 429 },
        );
      }
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
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content:
            `Texto para reescrever (idioma: ${language}):\n---\n${text}\n---\n${extraPrompt}`,
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
