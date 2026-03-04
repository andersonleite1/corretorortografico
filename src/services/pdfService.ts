/**
 * Solicita a geração de um PDF a partir de um documento HTML.
 * A API exige chave de acesso enviada via cabeçalho `x-api-key`.
 */
export async function requestPdfFromHtml(htmlDocument: string): Promise<Blob> {
  const response = await fetch("/api/pdf/export", {
    method: "POST",
    headers: {
      "Content-Type": "text/html",
    },
    body: htmlDocument,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `Falha na exportação: ${response.status}`);
  }

  return response.blob();
}
