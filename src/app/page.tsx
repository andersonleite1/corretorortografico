import { Suspense } from "react";
import type { Metadata } from "next";
import EditForm from "./[locale]/_components/EditForm";
import "./[locale]/style.scss";

export const metadata: Metadata = {
  title: "Corretor Ortográfico Online Grátis | Corrija Textos em Português",
  description:
    "Revise textos em português com o corretor ortográfico online integrado ao LanguageTool. Confira sugestões de ortografia, gramática e estilo direto no editor.",
  alternates: { canonical: "https://corretorortografico.online/" },
  openGraph: {
    type: "website",
    url: "https://corretorortografico.online/",
    title: "Corretor Ortográfico Online Grátis",
    description:
      "Escreva e revise textos com sugestões de ortografia, gramática e estilo.",
    siteName: "CorretorOrtografico.online",
    locale: "pt_BR",
  },
};

const faqs = [
  [
    "Como usar o corretor ortográfico online?",
    "Digite ou cole seu texto no editor. O LanguageTool analisa o conteúdo e apresenta sugestões de ortografia, gramática e estilo. Revise cada sugestão e escolha quais alterações aplicar.",
  ],
  [
    "O corretor ortográfico é gratuito?",
    "Sim. Você pode usar o editor e consultar sugestões sem criar uma conta.",
  ],
  [
    "Quais idiomas são aceitos?",
    "Nesta versão, a revisão está configurada para português brasileiro.",
  ],
  [
    "O site salva o texto que escrevo?",
    "O rascunho fica salvo localmente neste navegador e não é sincronizado entre dispositivos. Durante a análise, o texto é enviado ao LanguageTool por meio do servidor do site. A exportação em PDF usa o serviço de conversão configurado.",
  ],
  [
    "O corretor substitui uma revisão humana?",
    "Não. As sugestões automáticas ajudam a localizar possíveis problemas, mas avalie cada alteração para preservar o sentido e o estilo do texto.",
  ],
];

export default function HomePage() {
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "CorretorOrtografico.online",
    url: "https://corretorortografico.online/",
    description:
      "Corretor ortográfico online com revisão de textos pelo LanguageTool.",
    inLanguage: "pt-BR",
  };
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map(([question, answer]) => ({
      "@type": "Question",
      name: question,
      acceptedAnswer: { "@type": "Answer", text: answer },
    })),
  };

  return (
    <main className="min-h-screen bg-[#f7f9fc] text-slate-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(websiteSchema).replace(/</g, "\\u003c"),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqSchema).replace(/</g, "\\u003c"),
        }}
      />
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <a href="#inicio" className="text-lg font-bold tracking-tight">
            <span className="text-blue-700">Corretor</span>Ortografico.online
          </a>
          <a href="#duvidas" className="text-sm font-semibold text-slate-600 hover:text-blue-700">
            Dúvidas frequentes
          </a>
        </div>
      </header>

      <section id="inicio" className="px-4 pb-6 pt-8 sm:px-6 sm:pt-10">
        <div className="mx-auto max-w-7xl text-center">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-700">
            Revisão de texto em português
          </p>
          <h1 className="mx-auto mt-4 max-w-4xl text-4xl font-extrabold tracking-tight sm:text-5xl">
            Corretor ortográfico online grátis
          </h1>
          <p className="mx-auto mt-4 max-w-3xl text-lg leading-8 text-slate-600">
            Escreva ou cole seu texto no editor e confira sugestões de
            ortografia, gramática e estilo com o LanguageTool.
          </p>
        </div>
      </section>

      <section id="editor" aria-label="Editor com corretor ortográfico" className="px-2 pb-16 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <Suspense fallback={<div className="min-h-[620px] animate-pulse rounded-3xl border border-slate-200 bg-white" />}>
            <EditForm locale="pt" userPlan="free" />
          </Suspense>
          <p className="mt-3 text-center text-xs text-slate-500">
            O rascunho fica neste navegador. Durante a análise, o texto é
            enviado ao LanguageTool; a exportação em PDF usa um serviço de
            conversão configurado.
          </p>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white px-6 py-16 sm:py-20">
        <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-blue-700">Revisão online</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight">
              Revise a ortografia e a gramática do seu texto
            </h2>
          </div>
          <div className="space-y-5 text-base leading-7 text-slate-600">
            <p>
              Um corretor ortográfico online ajuda a encontrar problemas de
              grafia, acentuação e digitação. Com sugestões ao lado do editor,
              você revisa o texto sem alternar entre ferramentas.
            </p>
            <p>
              A integração com o LanguageTool também aponta sugestões de
              gramática e estilo. Nesta versão, a revisão está configurada para
              português brasileiro e você escolhe quais sugestões aplicar.
            </p>
            <p>
              O rascunho é salvo no armazenamento local do navegador. Não é
              necessário criar uma conta e os documentos não são sincronizados
              com um servidor.
            </p>
          </div>
        </div>
      </section>

      <section className="px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold tracking-tight">O que você pode revisar</h2>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {[
              ["Ortografia", "Confira grafia, acentuação e possíveis erros de digitação."],
              ["Gramática", "Analise sugestões sobre concordância e construção das frases."],
              ["Estilo e pontuação", "Veja recomendações que podem tornar a leitura mais clara."],
            ].map(([title, text]) => (
              <article key={title} className="rounded-2xl border border-slate-200 bg-white p-6">
                <h3 className="text-lg font-bold">{title}</h3>
                <p className="mt-3 leading-7 text-slate-600">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="duvidas" className="border-y border-slate-200 bg-white px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold tracking-tight">
            Dúvidas frequentes sobre o corretor ortográfico online
          </h2>
          <div className="mt-8 divide-y divide-slate-200">
            {faqs.map(([question, answer]) => (
              <article key={question} className="py-6">
                <h3 className="text-lg font-semibold">{question}</h3>
                <p className="mt-2 leading-7 text-slate-600">{answer}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <footer className="px-6 py-8">
        <div className="mx-auto max-w-6xl text-sm text-slate-500">
          © {new Date().getFullYear()} CorretorOrtografico.online
        </div>
      </footer>
    </main>
  );
}
