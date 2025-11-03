const PDF_API_ENDPOINT = "https://html-to-pdf-api-78hy.onrender.com/api/pdf/html";
// const PDF_API_ENDPOINT = "http://localhost:3007/api/pdf/html";

/**
 * Solicita a geração de um PDF a partir de um documento HTML.
 * A API exige chave de acesso enviada via cabeçalho `x-api-key`.
 */
export async function requestPdfFromHtml(htmlDocument: string): Promise<Blob> {
  const apiKey = process.env.NEXT_PUBLIC_PDF_API_KEY || "3xEt7CBU1XydZFeA4foiNgSGJOfCcwab";

  if (!apiKey) {
    throw new Error("Chave da API de PDF não configurada.");
  }

  const response = await fetch(PDF_API_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "text/html",
      "x-api-key": apiKey,
    },
    body: htmlDocument,
  });

  if (!response.ok) {
    throw new Error(`Falha na exportação: ${response.status}`);
  }

  return response.blob();
}
