import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const htmlDocument = await req.text();
        const apiKey = process.env.PDF_API_KEY;

        if (!apiKey) {
            console.error("PDF_API_KEY is not configured");
            return new NextResponse("Erro de configuração no servidor.", { status: 500 });
        }

        const response = await fetch("https://api.editordetexto.cloud/api/pdf/html", {
            method: "POST",
            headers: {
                "Content-Type": "text/html",
                "x-api-key": apiKey,
            },
            body: htmlDocument,
        });

        if (!response.ok) {
            const errorText = await response.text();
            return new NextResponse(errorText || `Erro na API remota: ${response.status}`, { status: response.status });
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
        return new NextResponse(error.message || "Erro interno no servidor de proxy", { status: 500 });
    }
}
