import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { LanguageToolResponse } from "@/types/languageTool";
import { ratelimit } from "@/lib/ratelimit";

const MAX_TEXT_LENGTH = 20000;
const apiEndpoint = "https://languagetool.editordetexto.cloud/v2/check";
const supportedLanguages = new Set(["pt-BR", "en-US", "es"]);
const defaultLanguage = "pt-BR";

export async function POST(request: NextRequest) {
  // --- Proteção contra Abuso (Origin Check) ---
  // NOTA DE REGRA DE NEGÓCIO: Este endpoint permanece público propositalmente.
  // Usuários não precisam estar logados para verificações gramaticais básicas.
  // A proteção é feita via Origin Check e Rate Limit por IP (SEG-02).
  const origin =
    request.headers.get("origin") || request.headers.get("referer");
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  // Verifica se a requisição originou de dentro da própria aplicação
  if (!origin || !origin.startsWith(appUrl)) {
    console.warn(`[LanguageTool API] Acesso negado para a origem: ${origin}`);
    return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
  }

  // ---------------------------------------------
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  const { success, reset } = await ratelimit.languageTool.limit(ip);

  if (!success) {
    const retryAfter = Math.ceil((reset - Date.now()) / 1000);
    return NextResponse.json(
      { error: "Muitas requisições. Tente novamente mais tarde." },
      { status: 429, headers: { "Retry-After": String(retryAfter) } },
    );
  }

  const respond = (data: object, init?: ResponseInit) =>
    NextResponse.json(data, init);

  try {
    const body = await request.json();
    const text = typeof body?.text === "string" ? body.text : "";
    const requestedLanguage =
      typeof body?.language === "string" ? body.language : defaultLanguage;
    const language = supportedLanguages.has(requestedLanguage)
      ? requestedLanguage
      : defaultLanguage;
    if (!text.trim()) {
      return respond(
        { error: "Texto inválido para análise." },
        { status: 400 },
      );
    }

    const trimmedText =
      text.length > MAX_TEXT_LENGTH ? text.slice(0, MAX_TEXT_LENGTH) : text;

    const params = new URLSearchParams();
    params.append("text", trimmedText);
    params.append("language", language);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const ltResponse = await fetch(apiEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
      cache: "no-store",
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!ltResponse.ok) {
      const details = await ltResponse.text();
      return respond(
        {
          error: "Falha ao consultar LanguageTool.",
          details,
        },
        { status: ltResponse.status },
      );
    }

    const data = (await ltResponse.json()) as LanguageToolResponse;

    return respond({
      matches: data.matches ?? [],
      language: data.language?.code ?? language,
    });
  } catch (error: any) {
    if (error.name === "AbortError") {
      return respond(
        {
          error:
            "O servidor de verificação demorou muito para responder. Tente novamente.",
        },
        { status: 504 },
      );
    }
    return respond(
      {
        error: "Erro inesperado ao consultar LanguageTool.",
      },
      { status: 500 },
    );
  }
}
