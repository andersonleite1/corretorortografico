"use client";

import { ChangeEvent, FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { convertPdfToHtml } from "@/services/pdfToHtmlService";
import { savePost } from "@/services/post";

const MAX_FILE_SIZE_MB = 15;
const PRIMARY_COLOR = "#3E9971";

export default function EditarPdfPage() {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const readableFileSize = useMemo(() => {
    if (!selectedFile) return null;
    if (selectedFile.size < 1024) return `${selectedFile.size} B`;
    if (selectedFile.size < 1024 * 1024) return `${(selectedFile.size / 1024).toFixed(1)} KB`;
    return `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB`;
  }, [selectedFile]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setError(null);
    setStatusMessage(null);

    if (!file) {
      setSelectedFile(null);
      return;
    }

    const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    if (!isPdf) {
      setError("Selecione um arquivo no formato PDF.");
      event.target.value = "";
      setSelectedFile(null);
      return;
    }

    const fileSizeInMb = file.size / (1024 * 1024);
    if (fileSizeInMb > MAX_FILE_SIZE_MB) {
      setError(`Limite de ${MAX_FILE_SIZE_MB}MB por arquivo.`);
      event.target.value = "";
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedFile) {
      setError("Escolha um PDF para começar.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setStatusMessage("Enviando PDF para conversão...");

    try {
      const htmlContent = await convertPdfToHtml(selectedFile);
      const derivedTitle = selectedFile.name.replace(/\.pdf$/i, "") || "Documento convertido";

      savePost({
        title: derivedTitle,
        content: htmlContent,
      });

      setStatusMessage("Conversão concluída! Abrindo o editor...");
      setTimeout(() => {
        router.push("/");
      }, 600);
    } catch (conversionError) {
      const message =
        conversionError instanceof Error
          ? conversionError.message
          : "Não foi possível converter seu PDF. Tente novamente.";
      setError(message);
      setStatusMessage(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setError(null);
    setStatusMessage(null);
  };

  const experienceHighlights = [
    "Conversão preserva hierarquia de títulos",
    "Listas, links e tabelas continuam editáveis",
    "Conteúdo já abre na Home para ajustes finais",
  ];

  const usageTopics = [
    {
      title: "Por que converter PDF para HTML editável?",
      content:
        "Documentos em PDF são ótimos para distribuição, mas difíceis de atualizar. Ao transformar o arquivo em HTML você ganha flexibilidade para revisar textos, ajustar mensagens e publicar em sites ou intranets sem começar do zero.",
    },
    {
      title: "Fluxo seguro e rápido",
      content:
        "Seu arquivo trafega apenas entre o seu navegador e nossa API protegida por token. Em cerca de segundos o texto já é salvo localmente e carregado no EditorDeTexto.online para revisão completa, evitando cadastros ou instalações.",
    },
    {
      title: "Formatação preservada e experiência fluida",
      content:
        "Depois da conversão você pode ajustar títulos, links e chamadas de ação no próprio editor. Isso reduz tempo de produção e mantém consistência visual em materiais como manuais, contratos, relatórios e e-books.",
    },
  ];

  return (
    <div className="bg-white text-slate-900">
      <section className="px-4 py-16 sm:py-20">
        <div className="mx-auto grid w-full max-w-6xl gap-12 lg:grid-cols-[1.05fr,0.95fr]">
          <div className="flex flex-col justify-center space-y-8">
            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.4em]" style={{ color: PRIMARY_COLOR }}>
                Conversão guiada
              </p>
              <h1 className="text-4xl font-semibold leading-tight text-slate-900 sm:text-5xl">
                Converta seu PDF em texto editável sem perder o design original
              </h1>
              <p className="text-lg text-slate-600">
                A página “Editar PDF” nasceu para importar relatórios, propostas comerciais e ebooks diretamente para o
                editor principal. Arraste o arquivo uma vez, aguarde segundos e continue escrevendo com a mesma
                experiência elegante disponível na Home.
              </p>
            </div>

            <div className="flex flex-wrap gap-3 text-sm font-medium text-slate-600">
              {experienceHighlights.map((feature) => (
                <span
                  key={feature}
                  className="rounded-full border border-slate-200 bg-white px-4 py-2 shadow-sm"
                  style={{ borderColor: "#dbe9e2" }}
                >
                  {feature}
                </span>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4 rounded-3xl border border-slate-200 bg-slate-50/70 p-6 text-sm text-slate-600 sm:grid-cols-3">
              <div>
                <span className="text-xs uppercase tracking-[0.25em] text-slate-500">Passo 1</span>
                <p className="mt-2 text-base font-semibold text-slate-900">Envie seu PDF</p>
                <p>Arquivos organizados garantem HTML limpo.</p>
              </div>
              <div>
                <span className="text-xs uppercase tracking-[0.25em] text-slate-500">Passo 2</span>
                <p className="mt-2 text-base font-semibold text-slate-900">Convertendo</p>
                <p>Em segundos tudo vira conteúdo editável.</p>
              </div>
              <div>
                <span className="text-xs uppercase tracking-[0.25em] text-slate-500">Passo 3</span>
                <p className="mt-2 text-base font-semibold text-slate-900">Continue na Home</p>
                <p>O texto aparece automaticamente no editor.</p>
              </div>
            </div>
          </div>

          <section className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-2xl shadow-slate-100">
            <div className="rounded-3xl bg-slate-50 p-6">
              <p className="text-sm font-semibold text-slate-500">Upload rápido e seguro</p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">Converter PDF para HTML</p>
            </div>

            <form className="mt-8 space-y-8" onSubmit={handleSubmit}>
              <div>
                <label
                  htmlFor="pdf-upload"
                  className="block cursor-pointer rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center transition hover:border-slate-400 hover:bg-slate-50"
                >
                  <input
                    id="pdf-upload"
                    type="file"
                    accept="application/pdf"
                    className="sr-only"
                    onChange={handleFileChange}
                  />
                  <span className="text-base font-semibold text-slate-900">Arraste seu PDF ou clique para selecionar</span>
                  <p className="mt-2 text-sm text-slate-500">Aceitamos arquivos até {MAX_FILE_SIZE_MB}MB</p>
                  {selectedFile && (
                    <div className="mt-6 rounded-2xl bg-slate-50 px-6 py-4 text-left">
                      <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-500">
                        Pronto para converter
                      </p>
                      <p className="mt-2 truncate text-lg font-medium text-slate-900">{selectedFile.name}</p>
                      <p className="text-sm text-slate-500">{readableFileSize}</p>
                      <button
                        type="button"
                        onClick={handleReset}
                        className="mt-4 text-sm font-semibold"
                        style={{ color: PRIMARY_COLOR }}
                      >
                        Trocar arquivo
                      </button>
                    </div>
                  )}
                </label>
              </div>

              <div className="space-y-4 text-sm">
                {error && (
                  <p className="font-medium text-rose-600" role="alert">
                    {error}
                  </p>
                )}
                {statusMessage && (
                  <p className="text-emerald-600" aria-live="polite">
                    {statusMessage}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-4 sm:flex-row">
                <button
                  type="submit"
                  disabled={isSubmitting || !selectedFile}
                  className="inline-flex flex-1 items-center justify-center rounded-2xl px-6 py-4 text-base font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60"
                  style={{ backgroundColor: PRIMARY_COLOR }}
                >
                  {isSubmitting ? "Convertendo..." : "Converter e abrir no editor"}
                </button>
                <button
                  type="button"
                  onClick={() => router.push("/")}
                  className="rounded-2xl border border-slate-200 px-6 py-4 text-base font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-900"
                >
                  Voltar para a Home
                </button>
              </div>
            </form>
          </section>
        </div>
      </section>

      <section className="border-t border-slate-100 bg-[#F6F9F7] px-4 py-16">
        <div className="mx-auto max-w-5xl space-y-8 text-slate-700">
          <div className="space-y-4 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.4em]" style={{ color: PRIMARY_COLOR }}>
              Dicas práticas
            </p>
            <h2 className="text-3xl font-semibold text-slate-900">Use cada conversão a seu favor</h2>
            <p className="text-lg text-slate-600">
              O conversor de PDF para HTML do EditorDeTexto.online ajuda equipes a agilizar atualizações de contratos,
              catálogos, editais e materiais educacionais. Após o upload, o texto surge imediatamente no editor principal
              para você ajustar, colaborar e publicar em qualquer canal digital.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {usageTopics.map((topic) => (
              <article key={topic.title} className="rounded-3xl border border-[#dbe9e2] bg-white/80 p-6 shadow-sm">
                <h3 className="text-xl font-semibold text-slate-900">{topic.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">{topic.content}</p>
              </article>
            ))}
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
            <h3 className="text-2xl font-semibold text-slate-900">Melhores práticas de edição online</h3>
            <ul className="mt-4 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
              <li className="rounded-2xl bg-slate-50 px-4 py-3">
                Heading tags bem distribuídas tornam o texto mais legível e fácil de navegar em qualquer dispositivo.
              </li>
              <li className="rounded-2xl bg-slate-50 px-4 py-3">Adicione CTAs claros e links internos diretamente no editor.</li>
              <li className="rounded-2xl bg-slate-50 px-4 py-3">A conversão preserva textos alternativos para imagens.</li>
              <li className="rounded-2xl bg-slate-50 px-4 py-3">HTML limpo garante carregamento rápido e melhor acessibilidade.</li>
            </ul>
            <p className="mt-6 text-base text-slate-600">
              Use esta página sempre que precisar adaptar materiais corporativos, apostilas ou catálogos para campanhas
              digitais. Quanto mais atualizados estiverem os textos, mais fácil será manter uma comunicação consistente
              em newsletters, blogs e redes sociais.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
