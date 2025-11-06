import { NextRequest, NextResponse } from "next/server";
import { LanguageToolResponse } from "@/types/languageTool";

const RATE_LIMIT = 19;
const WINDOW_MS = 60_000;
const MAX_TEXT_LENGTH = 20000;

let requestLog: number[] = [];

const apiEndpoint = "https://api.languagetool.org/v2/check";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const text = typeof body?.text === "string" ? body.text : "";
    if (!text.trim()) {
      return NextResponse.json(
        { error: "Texto inválido para análise." },
        { status: 400 }
      );
    }

    const now = Date.now();
    requestLog = requestLog.filter((timestamp) => now - timestamp < WINDOW_MS);

    if (requestLog.length >= RATE_LIMIT) {
      return NextResponse.json(
        {
          error: "Limite de requisições do LanguageTool atingido. Aguarde alguns instantes e tente novamente.",
        },
        { status: 429 }
      );
    }

    const trimmedText =
      text.length > MAX_TEXT_LENGTH ? text.slice(0, MAX_TEXT_LENGTH) : text;

    const params = new URLSearchParams();
    params.append("text", trimmedText);
    params.append("language", "pt-BR");

    const ltResponse = await fetch(apiEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
      cache: "no-store",
    });

    if (!ltResponse.ok) {
      const details = await ltResponse.text();
      return NextResponse.json(
        {
          error: "Falha ao consultar LanguageTool.",
          details,
        },
        { status: ltResponse.status }
      );
    }

    const data = (await ltResponse.json()) as LanguageToolResponse;
    requestLog.push(now);

    return NextResponse.json({
      matches: data.matches ?? [],
      language: data.language?.code ?? "pt-BR",
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Erro inesperado ao consultar LanguageTool.",
      },
      { status: 500 }
    );
  }
}
