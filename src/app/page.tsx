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
  twitter: {
    card: "summary_large_image",
    title: "Corretor Ortográfico Online Grátis",
    description:
      "Revise ortografia, gramática e pontuação em português brasileiro, sem cadastro.",
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
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-6 py-4">
          <a href="#inicio" className="text-lg font-bold tracking-tight">
            <span className="text-blue-700">Corretor</span>Ortografico.online
          </a>
          <a
            href="#duvidas"
            className="text-sm font-semibold text-slate-600 hover:text-blue-700"
          >
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
          <p className="mt-4 text-sm font-semibold text-slate-600">
            Grátis · Sem cadastro · Português brasileiro
          </p>
        </div>
      </section>

      <section
        id="editor"
        aria-label="Editor com corretor ortográfico"
        className="px-2 pb-16 sm:px-6"
      >
        <div className="mx-auto max-w-7xl">
          <Suspense
            fallback={
              <div className="min-h-[620px] animate-pulse rounded-3xl border border-slate-200 bg-white" />
            }
          >
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
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-blue-700">
              Revisão online
            </p>
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

      <section id="como-usar" className="px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold tracking-tight">
            Como corrigir seu texto online
          </h2>
          <p className="mt-4 max-w-3xl leading-7 text-slate-600">
            Use o corretor de texto online para revisar sua escrita em português
            brasileiro. Você acompanha as sugestões sem sair do editor.
          </p>
          <ol className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              [
                "Digite ou cole",
                "Insira o texto na área de edição. O nome do rascunho é opcional.",
              ],
              [
                "Aguarde a análise",
                "Ao fazer uma pausa na digitação, o LanguageTool procura possíveis problemas no texto.",
              ],
              [
                "Revise as sugestões",
                "Confira os trechos destacados e escolha quais alterações aplicar, de acordo com o contexto.",
              ],
              [
                "Copie ou exporte",
                "Depois da revisão, copie seu texto ou use as opções de exportação do editor.",
              ],
            ].map(([title, text], index) => (
              <li
                key={title}
                className="rounded-2xl border border-slate-200 bg-white p-6"
              >
                <span
                  aria-hidden="true"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 font-bold text-blue-700"
                >
                  {index + 1}
                </span>
                <h3 className="mt-4 text-lg font-semibold">{title}</h3>
                <p className="mt-2 leading-7 text-slate-600">{text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold tracking-tight">
            O que você pode revisar
          </h2>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {[
              [
                "Ortografia",
                "Confira grafia, acentuação e possíveis erros de digitação.",
              ],
              [
                "Gramática",
                "Analise sugestões sobre concordância e construção das frases.",
              ],
              [
                "Estilo e pontuação",
                "Veja recomendações que podem tornar a leitura mais clara.",
              ],
            ].map(([title, text]) => (
              <article
                key={title}
                className="rounded-2xl border border-slate-200 bg-white p-6"
              >
                <h3 className="text-lg font-bold">{title}</h3>
                <p className="mt-3 leading-7 text-slate-600">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        id="exemplos"
        className="border-y border-slate-200 bg-white px-6 py-16 sm:py-20"
      >
        <div className="mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold tracking-tight">
            Exemplos de correção ortográfica, gramatical e de pontuação
          </h2>
          <p className="mt-4 max-w-3xl leading-7 text-slate-600">
            A ortografia trata da escrita das palavras. A gramática também
            considera como elas se relacionam na frase. Já a pontuação ajuda a
            organizar a leitura. Veja exemplos de sugestões verificadas no
            LanguageTool usado por este editor.
          </p>
          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            {[
              {
                title: "Ortografia",
                before: "Precizamos revisar o texto antes de enviar.",
                after: "Precisamos revisar o texto antes de enviar.",
                explanation:
                  "A palavra “precisamos” é escrita com s, e não com z.",
              },
              {
                title: "Concordância gramatical",
                before: "Os documento estão prontos para revisão.",
                after: "Os documentos estão prontos para revisão.",
                explanation:
                  "O substantivo “documentos” acompanha o plural de “os”.",
              },
              {
                title: "Pontuação e espaçamento",
                before: "O texto está pronto , vamos revisar.",
                after: "O texto está pronto, vamos revisar.",
                explanation:
                  "A vírgula fica junto à palavra anterior, sem espaço antes dela.",
              },
            ].map(({ title, before, after, explanation }) => (
              <article
                key={title}
                className="min-w-0 rounded-2xl border border-slate-200 p-6"
              >
                <h3 className="text-lg font-semibold">{title}</h3>
                <dl className="mt-5 space-y-4 leading-7">
                  <div>
                    <dt className="text-sm font-semibold text-slate-600">
                      Antes
                    </dt>
                    <dd className="mt-1 text-slate-700">{before}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-semibold text-blue-700">
                      Após a sugestão
                    </dt>
                    <dd className="mt-1 text-slate-900">{after}</dd>
                  </div>
                </dl>
                <p className="mt-5 leading-7 text-slate-600">{explanation}</p>
              </article>
            ))}
          </div>
          <p className="mt-5 max-w-3xl text-sm leading-6 text-slate-600">
            As sugestões podem variar conforme o contexto e a disponibilidade do
            serviço. Um corretor gramatical online pode apoiar sua revisão, mas
            não garante que todos os erros ou usos de vírgula sejam
            identificados.
          </p>
        </div>
      </section>

      <section className="px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold tracking-tight">
            Revise textos do dia a dia
          </h2>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {[
              [
                "E-mails e mensagens",
                "Confira grafia e clareza antes de enviar uma mensagem pessoal ou profissional.",
              ],
              [
                "Trabalhos escolares",
                "Revise a escrita de resumos e trabalhos. O corretor não atribui notas nem avalia os critérios de uma redação.",
              ],
              [
                "Textos profissionais",
                "Procure possíveis problemas em relatórios, apresentações e publicações, preservando o vocabulário adequado ao seu público.",
              ],
            ].map(([title, text]) => (
              <article
                key={title}
                className="rounded-2xl border border-slate-200 bg-white p-6"
              >
                <h3 className="text-lg font-semibold">{title}</h3>
                <p className="mt-3 leading-7 text-slate-600">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        id="duvidas"
        className="border-y border-slate-200 bg-white px-6 py-16 sm:py-20"
      >
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

      <section id="sobre" className="px-6 py-16 sm:py-20">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 md:grid-cols-2 md:gap-12">
          <div className="min-w-0">
            <h2 className="text-3xl font-bold tracking-tight">
              Sobre o CorretorOrtografico
              <wbr />
              .online
            </h2>
            <p className="mt-4 leading-7 text-slate-600">
              O CorretorOrtografico.online reúne edição e revisão de textos em
              português brasileiro em uma página gratuita, sem criação de conta.
              As sugestões de escrita são fornecidas pelo{" "}
              <a
                href="https://languagetool.org/pt"
                className="font-semibold text-blue-700 underline underline-offset-4"
              >
                LanguageTool
              </a>
              . A decisão sobre cada alteração é sua.
            </p>
          </div>
          <div className="min-w-0">
            <h3 className="text-lg font-semibold">Contato</h3>
            <p className="mt-3 leading-7 text-slate-600">
              Para dúvidas sobre a ferramenta, problemas de funcionamento ou
              informações sobre o tratamento de dados, entre em contato:
            </p>
            <a
              href="mailto:contato@corretorortografico.online"
              className="mt-3 inline-block break-all font-semibold text-blue-700 underline underline-offset-4"
            >
              contato@corretorortografico.online
            </a>
          </div>
        </div>
      </section>

      <section
        id="privacidade"
        className="border-y border-slate-200 bg-white px-6 py-16 sm:py-20"
      >
        <div className="mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold tracking-tight">
            Privacidade: como seus textos são tratados
          </h2>
          <div className="mt-8 grid gap-8 md:grid-cols-3">
            <div>
              <h3 className="text-lg font-semibold">Rascunho no navegador</h3>
              <p className="mt-3 leading-7 text-slate-600">
                O salvamento de rascunhos usa o armazenamento local deste
                navegador, sem sincronização com uma conta ou banco de dados do
                site. Limpar os dados do navegador pode apagar seus rascunhos;
                exporte uma cópia dos textos que deseja guardar.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold">
                Análise com LanguageTool
              </h3>
              <p className="mt-3 leading-7 text-slate-600">
                Durante a revisão, o texto é enviado ao servidor do site, que
                encaminha a análise ao LanguageTool. A correção precisa de
                conexão com a internet; ela não acontece apenas no seu
                dispositivo.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold">Exportação em PDF</h3>
              <p className="mt-3 leading-7 text-slate-600">
                Quando você escolhe exportar em PDF, o documento é enviado ao
                serviço de conversão configurado pelo site. Esse envio ocorre
                para gerar o arquivo solicitado.
              </p>
            </div>
          </div>
          <p className="mt-8 max-w-3xl text-sm leading-6 text-slate-600">
            O salvamento local não significa que o texto fique apenas no
            navegador durante a análise ou a conversão em PDF. Para esclarecer
            dúvidas sobre esse processamento, use o contato acima.
          </p>
        </div>
      </section>

      <footer className="px-6 py-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-5 text-sm text-slate-600 md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} CorretorOrtografico.online</p>
          <nav
            aria-label="Informações do site"
            className="flex flex-wrap gap-x-6 gap-y-3"
          >
            <a href="#como-usar" className="hover:text-blue-700">
              Como usar
            </a>
            <a href="#sobre" className="hover:text-blue-700">
              Sobre e contato
            </a>
            <a href="#privacidade" className="hover:text-blue-700">
              Privacidade
            </a>
          </nav>
        </div>
      </footer>
    </main>
  );
}
