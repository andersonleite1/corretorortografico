const PDF_TO_HTML_ENDPOINT =
  "https://html-to-pdf-api-edt.fly.dev/api/pdf/to-html";
const DEFAULT_TOKEN = "3xEt7CBU1XydZFeA4foiNgSGJOfCcwab";

/**
 * Envia um PDF para a API externa e retorna o HTML convertido.
 */
export async function convertPdfToHtml(file: File | Blob): Promise<string> {
  const token = process.env.NEXT_PUBLIC_PDF_TO_HTML_TOKEN || DEFAULT_TOKEN;

  if (!token) {
    throw new Error("Token de acesso não configurado para converter o PDF.");
  }

  const response = await fetch(PDF_TO_HTML_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/pdf",
      Authorization: `Bearer ${token}`,
    },
    body: file,
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => "");
    const message = errorBody || `Falha na conversão (${response.status}).`;
    throw new Error(message);
  }

  return response.text();
}
