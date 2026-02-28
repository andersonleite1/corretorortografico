import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import DOMPurify from "isomorphic-dompurify";

const ipRateLimitMap = new Map<string, { count: number; resetTime: number }>();
const LIMIT = 10;
const WINDOW_IN_MS = 60 * 1000;

export async function POST(req: Request) {
  try {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0] ||
      req.headers.get("x-real-ip") ||
      "unknown";
    const now = Date.now();

    const rateLimitInfo = ipRateLimitMap.get(ip);
    if (rateLimitInfo) {
      if (now > rateLimitInfo.resetTime) {
        ipRateLimitMap.set(ip, { count: 1, resetTime: now + WINDOW_IN_MS });
      } else {
        if (rateLimitInfo.count >= LIMIT) {
          return new NextResponse(
            "Rate limit exceeded. Tente novamente em 1 minuto.",
            { status: 429 },
          );
        }
        rateLimitInfo.count++;
      }
    } else {
      ipRateLimitMap.set(ip, { count: 1, resetTime: now + WINDOW_IN_MS });
    }

    const htmlDocument = await req.text();
    const apiKey = process.env.PDF_API_KEY;

    if (!apiKey) {
      console.error("PDF_API_KEY is not configured");
      return new NextResponse("Erro de configuração no servidor.", {
        status: 500,
      });
    }

    if (!htmlDocument) {
      return new NextResponse("Documento HTML é obrigatório", { status: 400 });
    }

    const sanitizedHtml = DOMPurify.sanitize(htmlDocument, {
      USE_PROFILES: { html: true }, // permite tags HTML normais
    });

    const response = await fetch(
      "https://api.editordetexto.cloud/api/pdf/html",
      {
        method: "POST",
        headers: {
          "Content-Type": "text/html",
          "x-api-key": apiKey,
        },
        body: sanitizedHtml,
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      return new NextResponse(
        errorText || `Erro na API remota: ${response.status}`,
        { status: response.status },
      );
    }

    const pdfBlob = await response.blob();

    return new NextResponse(pdfBlob, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="export.pdf"',
      },
    });
  } catch (error: any) {
    console.error("Erro no proxy de PDF:", error);
    return new NextResponse("Erro interno no servidor de proxy.", {
      status: 500,
    });
  }
}
