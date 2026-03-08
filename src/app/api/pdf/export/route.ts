import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import DOMPurify from "isomorphic-dompurify";
import { ratelimit } from "@/lib/ratelimit";

export async function POST(req: Request) {
  try {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0] ||
      req.headers.get("x-real-ip") ||
      "unknown";

    const { success } = await ratelimit.pdfExport.limit(ip);
    if (!success) {
      return new NextResponse(
        "Rate limit exceeded. Tente novamente em 1 minuto.",
        { status: 429 },
      );
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

    let sanitizedHtml = DOMPurify.sanitize(htmlDocument, {
      USE_PROFILES: { html: true }, // permite tags HTML normais
      WHOLE_DOCUMENT: true,
      ADD_TAGS: ["html", "head", "meta", "style", "body"],
      ADD_ATTR: ["charset", "lang"],
    });

    // Ensure the DOCTYPE is preserved as it might be stripped
    if (!sanitizedHtml.toLowerCase().startsWith("<!doctype html>")) {
      sanitizedHtml = `<!DOCTYPE html>\n${sanitizedHtml}`;
    }

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
      console.error(`Status remoto: ${response.status} de api.editordetexto.cloud/api/pdf/html`);
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
