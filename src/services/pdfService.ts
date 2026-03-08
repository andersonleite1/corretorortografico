/**
 * Solicita a geração de um PDF a partir de um documento HTML.
 * A API exige chave de acesso enviada via cabeçalho `x-api-key`.
 */
export async function requestPdfFromHtml(htmlDocument: string): Promise<Blob> {
  const response = await fetch("/api/export-import/export-pdf", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ htmlContent: htmlDocument }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `Falha na exportação: ${response.status}`);
  }

  return response.blob();
}
