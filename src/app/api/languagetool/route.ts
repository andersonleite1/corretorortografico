import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { LanguageToolResponse } from "@/types/languageTool";

const GLOBAL_RATE_LIMIT = 19;
const WINDOW_MS = 60_000;
const MAX_TEXT_LENGTH = 20000;
const SESSION_LIMIT = 4;
const SESSION_COOKIE = "lt_session_id";

let requestLog: number[] = [];
const sessionLogs = new Map<string, number[]>();

const apiEndpoint = "https://api.languagetool.org/v2/check";

export async function POST(request: NextRequest) {
  let sessionId = request.cookies.get(SESSION_COOKIE)?.value;
  let shouldSetCookie = false;
  if (!sessionId) {
    sessionId = randomUUID();
    shouldSetCookie = true;
  }

  const respond = (data: object, init?: ResponseInit) => {
    const response = NextResponse.json(data, init);
    if (shouldSetCookie && sessionId) {
      response.cookies.set({
        name: SESSION_COOKIE,
        value: sessionId,
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 dias
      });
    }
    return response;
  };

  try {

    const body = await request.json();
    const text = typeof body?.text === "string" ? body.text : "";
    if (!text.trim()) {
      return respond({ error: "Texto inválido para análise." }, { status: 400 });
    }

    const now = Date.now();
    requestLog = requestLog.filter((timestamp) => now - timestamp < WINDOW_MS);

    if (requestLog.length >= GLOBAL_RATE_LIMIT) {
      return respond(
        {
          error: "Limite global de requisições do LanguageTool atingido. Aguarde alguns instantes e tente novamente.",
        },
        { status: 429 }
      );
    }

    const sessionEntries = sessionLogs.get(sessionId) ?? [];
    const recentSessionEntries = sessionEntries.filter((timestamp) => now - timestamp < WINDOW_MS);
    if (recentSessionEntries.length >= SESSION_LIMIT) {
      return respond(
        {
          error: "Você atingiu o limite de verificações por minuto. Aguarde alguns instantes e tente novamente.",
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
      return respond(
        {
          error: "Falha ao consultar LanguageTool.",
          details,
        },
        { status: ltResponse.status }
      );
    }

    const data = (await ltResponse.json()) as LanguageToolResponse;
    requestLog.push(now);
    recentSessionEntries.push(now);
    sessionLogs.set(sessionId, recentSessionEntries);

    return respond({
      matches: data.matches ?? [],
      language: data.language?.code ?? "pt-BR",
    });
  } catch (error) {
    return respond(
      {
        error: "Erro inesperado ao consultar LanguageTool.",
      },
      { status: 500 }
    );
  }
}
