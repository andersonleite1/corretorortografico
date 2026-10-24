import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { LanguageToolResponse } from "@/types/languageTool";
import { limitRequests } from "@/lib/memory-rate-limit";

const MAX_TEXT_LENGTH = 20000;
const apiEndpoints = (
  process.env.LANGUAGETOOL_ENDPOINTS ||
  "https://languagetool.editordetexto.cloud/v2/check,https://languagetool.andersonleite.dev.br/v2/check"
)
  .split(",")
  .map((endpoint) => endpoint.trim())
  .filter(Boolean);
const upstreamTimeoutMs = 4000;
const supportedLanguages = new Set(["pt-BR", "en-US", "es"]);
const defaultLanguage = "pt-BR";

export async function POST(request: NextRequest) {
  // --- Proteção contra Abuso (Origin Check) ---
  // NOTA DE REGRA DE NEGÓCIO: Este endpoint permanece público propositalmente.
  // Usuários não precisam estar logados para verificações gramaticais básicas.
  // A proteção é feita via Origin Check e Rate Limit por IP (SEG-02).
  const origin = request.headers.get("origin") || request.headers.get("referer") || "";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://corretorortografico.online";
  const appHost = new URL(appUrl).hostname;
  let originHost = "";
  try {
    originHost = new URL(origin).hostname;
  } catch {
    // Abaixo, uma origem inválida será recusada.
  }

  const isLocalhost =
    originHost === "localhost" ||
    originHost === "127.0.0.1" ||
    originHost.startsWith("192.168.") ||
    originHost.startsWith("10.");
  const isPreview = originHost.endsWith(".vercel.app");
  const isProduction =
    originHost === appHost || originHost === "corretorortografico.online";

  if (!origin || (!isLocalhost && !isPreview && !isProduction)) {
    console.warn(`[LanguageTool API] Acesso negado para a origem: ${origin}`);
    return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
  }

  // ---------------------------------------------
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  const { success, reset } = limitRequests(ip);

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

    let lastError: unknown;

    for (const apiEndpoint of apiEndpoints) {
      const controller = new AbortController();
      const timeoutId = setTimeout(
        () => controller.abort(),
        upstreamTimeoutMs,
      );

      try {
        const ltResponse = await fetch(apiEndpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: params.toString(),
          cache: "no-store",
          signal: controller.signal,
        });

        if (ltResponse.ok) {
          const data = (await ltResponse.json()) as LanguageToolResponse;
          console.info(`[LanguageTool API] Upstream usado: ${apiEndpoint}`);
          return respond({
            matches: data.matches ?? [],
            language: data.language?.code ?? language,
          });
        }

        const details = await ltResponse.text();
        lastError = new Error(
          `Upstream ${apiEndpoint} respondeu ${ltResponse.status}`,
        );

        // Erros de requisição não serão mascarados pelo segundo upstream.
        if (ltResponse.status < 500) {
          return respond(
            { error: "Falha ao consultar LanguageTool.", details },
            { status: ltResponse.status },
          );
        }
      } catch (error) {
        lastError = error;
        console.warn(
          `[LanguageTool API] Falha no upstream ${apiEndpoint}; tentando o próximo.`,
          error,
        );
      } finally {
        clearTimeout(timeoutId);
      }
    }

    console.error("[LanguageTool API] Todos os upstreams falharam:", lastError);
    return respond(
      { error: "Serviço de verificação temporariamente indisponível." },
      { status: 503 },
    );
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
