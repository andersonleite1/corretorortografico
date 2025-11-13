"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { convertPdfToHtml } from "@/services/pdfToHtmlService";
import { savePost } from "@/services/post";

const MAX_FILE_SIZE_MB = 15;
const PRIMARY_COLOR = "#3E9971";
const SUBMISSION_COOLDOWN_MS = 3 * 60 * 1000; // 3 minutes
const STORAGE_KEY_NEXT_UPLOAD = "pdfUploadNextTime";

const formatMillisecondsToClock = (ms: number) => {
  const totalSeconds = Math.ceil(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const paddedMinutes = minutes.toString().padStart(2, "0");
  const paddedSeconds = seconds.toString().padStart(2, "0");
  return `${paddedMinutes}:${paddedSeconds}`;
};

export default function EditarPdfClient() {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [nextUploadTime, setNextUploadTime] = useState<number | null>(null);
  const [cooldownRemainingMs, setCooldownRemainingMs] = useState(0);

  const readableFileSize = useMemo(() => {
    if (!selectedFile) return null;
    if (selectedFile.size < 1024) return `${selectedFile.size} B`;
    if (selectedFile.size < 1024 * 1024) return `${(selectedFile.size / 1024).toFixed(1)} KB`;
    return `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB`;
  }, [selectedFile]);

  const cooldownLabel = useMemo(() => {
    if (cooldownRemainingMs <= 0) return null;
    return formatMillisecondsToClock(cooldownRemainingMs);
  }, [cooldownRemainingMs]);

  const isCooldownActive = cooldownRemainingMs > 0;

  useEffect(() => {
    if (typeof window === "undefined") return;
    const storedNextTime = window.localStorage.getItem(STORAGE_KEY_NEXT_UPLOAD);
    if (!storedNextTime) return;

    const parsedTime = parseInt(storedNextTime, 10);
    if (Number.isNaN(parsedTime)) {
      window.localStorage.removeItem(STORAGE_KEY_NEXT_UPLOAD);
      return;
    }

    if (parsedTime <= Date.now()) {
      window.localStorage.removeItem(STORAGE_KEY_NEXT_UPLOAD);
      return;
    }

    setNextUploadTime(parsedTime);
  }, []);

  useEffect(() => {
    if (!nextUploadTime) {
      setCooldownRemainingMs(0);
      return;
    }

    const updateRemaining = () => {
      const remaining = Math.max(nextUploadTime - Date.now(), 0);
      setCooldownRemainingMs(remaining);
      if (remaining === 0) {
        setNextUploadTime(null);
        if (typeof window !== "undefined") {
          window.localStorage.removeItem(STORAGE_KEY_NEXT_UPLOAD);
        }
      }
    };

    updateRemaining();
    const intervalId = window.setInterval(updateRemaining, 1000);
    return () => window.clearInterval(intervalId);
  }, [nextUploadTime]);

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

    if (nextUploadTime && nextUploadTime > Date.now()) {
      const remaining = Math.max(nextUploadTime - Date.now(), 0);
      setError(`Aguarde ${formatMillisecondsToClock(remaining)} para enviar outro PDF.`);
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
      const unlockAt = Date.now() + SUBMISSION_COOLDOWN_MS;
      setNextUploadTime(unlockAt);
      setCooldownRemainingMs(SUBMISSION_COOLDOWN_MS);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(STORAGE_KEY_NEXT_UPLOAD, unlockAt.toString());
      }
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
    "Envio controlado a cada 3 minutos para estabilidade",
  ];

  const usageTopics = [
    {
      title: "Por que converter PDF para HTML editável?",
      content:
        "Documentos em PDF são ótimos para distribuição, mas difíceis de atualizar. Ao transformar o arquivo em HTML você ganha flexibilidade para revisar textos, ajustar mensagens e publicar em sites ou intranets sem começar do zero — o jeito mais simples de editar PDF online.",
    },
    {
      title: "Fluxo seguro e rápido",
      content:
        "Seu arquivo trafega apenas entre o seu navegador e nossa API protegida por token. Em poucos segundos o texto já é salvo localmente e carregado no editor de PDF gratuito do EditorDeTexto.online para revisão completa, evitando cadastros ou instalações.",
    },
    {
      title: "Formatação preservada e experiência fluida",
      content:
        "Depois da conversão você pode ajustar títulos, links e chamadas de ação no próprio editor. Isso reduz tempo de produção e mantém consistência visual em materiais como manuais, contratos, relatórios e e-books — perfeito para converter e gerenciar arquivos PDF sem retrabalho.",
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
                Editar PDF online ficou simples e totalmente gratuito
              </h1>
              <p className="text-lg text-slate-600">
                Esta ferramenta para editar PDF transforma seus uploads em HTML editável e abre tudo no editor principal
                do EditorDeTexto.online. Ao respeitar o limite de um envio a cada três minutos, garantimos estabilidade
                para quem precisa converter e gerenciar arquivos PDF sem perder o visual original.
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
                {isCooldownActive && cooldownLabel && (
                  <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 font-medium text-slate-700">
                    <span>Próximo envio liberado em</span>
                    <span className="text-lg font-semibold" style={{ color: PRIMARY_COLOR }}>
                      {cooldownLabel}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-4 sm:flex-row">
                <button
                  type="submit"
                  disabled={isSubmitting || !selectedFile || isCooldownActive}
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
            <h2 className="text-3xl font-semibold text-slate-900">Gerencie e edite PDFs com tranquilidade</h2>
            <p className="text-lg text-slate-600">
              O conversor de PDF para HTML do EditorDeTexto.online ajuda equipes a agilizar atualizações de contratos,
              catálogos, editais e materiais educacionais. Após o upload, o texto surge imediatamente no editor de PDF
              gratuito para você ajustar, colaborar e publicar em qualquer canal digital.
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
              em newsletters, blogs e redes sociais usando uma verdadeira ferramenta para editar PDF direto no navegador.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
