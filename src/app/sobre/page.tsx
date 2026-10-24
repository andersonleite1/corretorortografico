import type { Metadata } from "next";
import Link from "next/link";
import SiteInfoPage from "@/components/shared/SiteInfoPage";

export const metadata: Metadata = {
  title: "Sobre o CorretorOrtografico.online",
  description:
    "Conheça o corretor ortográfico online em português brasileiro, como funciona a revisão com LanguageTool e como entrar em contato.",
  alternates: { canonical: "https://corretorortografico.online/sobre" },
  openGraph: {
    type: "website",
    url: "https://corretorortografico.online/sobre",
    title: "Sobre o CorretorOrtografico.online",
    description:
      "Conheça a ferramenta gratuita de revisão de textos em português brasileiro.",
    siteName: "CorretorOrtografico.online",
    locale: "pt_BR",
  },
};

export default function AboutPage() {
  return (
    <SiteInfoPage
      title="Sobre o CorretorOrtografico.online"
      description="Uma ferramenta online para revisar textos em português brasileiro com sugestões de ortografia, gramática e estilo."
    >
      <section aria-labelledby="proposta">
        <h2 id="proposta" className="text-xl font-semibold text-slate-900">
          Nossa proposta
        </h2>
        <p className="mt-3">
          O CorretorOrtografico.online reúne um editor de texto e sugestões de
          revisão em uma página gratuita, sem necessidade de criar uma conta.
          Você pode escrever ou colar um texto, analisar possíveis problemas e
          decidir quais sugestões fazem sentido para o contexto.
        </p>
      </section>

      <section aria-labelledby="funcionamento">
        <h2
          id="funcionamento"
          className="text-xl font-semibold text-slate-900"
        >
          Como funciona
        </h2>
        <p className="mt-3">
          A revisão é feita pela integração com o LanguageTool, configurada
          nesta versão para português brasileiro. As sugestões podem apontar
          questões de ortografia, gramática, estilo e pontuação. Elas são um
          apoio à escrita e não substituem a leitura e a decisão de quem
          escreveu.
        </p>
      </section>

      <section aria-labelledby="rascunhos">
        <h2 id="rascunhos" className="text-xl font-semibold text-slate-900">
          Seus rascunhos
        </h2>
        <p className="mt-3">
          Os rascunhos ficam no armazenamento local do navegador utilizado. O
          site não oferece conta ou sincronização dos documentos com uma nuvem.
          Durante a análise, o texto é enviado ao serviço de revisão; a
          exportação em PDF também envia o documento ao serviço de conversão
          configurado.
        </p>
      </section>

      <section aria-labelledby="contato">
        <h2 id="contato" className="text-xl font-semibold text-slate-900">
          Contato
        </h2>
        <p className="mt-3">
          Para dúvidas sobre a ferramenta ou para informar um problema, escreva
          para{" "}
          <a
            href="mailto:contato@corretorortografico.online"
            className="font-semibold text-blue-700 underline underline-offset-4"
          >
            contato@corretorortografico.online
          </a>
          .
        </p>
      </section>

      <p>
        <Link
          href="/#editor"
          className="inline-flex rounded-full bg-blue-700 px-5 py-3 font-semibold text-white hover:bg-blue-800"
        >
          Ir para o corretor ortográfico
        </Link>
      </p>
    </SiteInfoPage>
  );
}
