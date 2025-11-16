import { NextRequest, NextResponse } from "next/server";
import { LanguageToolResponse } from "@/types/languageTool";

const MAX_TEXT_LENGTH = 20000;
const apiEndpoint = "https://languagetool.editordetexto.cloud/v2/check";

export async function POST(request: NextRequest) {
  const respond = (data: object, init?: ResponseInit) =>
    NextResponse.json(data, init);

  try {
    const body = await request.json();
    const text = typeof body?.text === "string" ? body.text : "";
    if (!text.trim()) {
      return respond({ error: "Texto inválido para análise." }, { status: 400 });
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
