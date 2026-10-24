import type { Metadata } from "next";
import Link from "next/link";
import SiteInfoPage from "@/components/shared/SiteInfoPage";

export const metadata: Metadata = {
  title: "Privacidade | CorretorOrtografico.online",
  description:
    "Saiba como o CorretorOrtografico.online trata rascunhos locais, textos enviados para revisão, exportação em PDF e estatísticas de visitas.",
  alternates: { canonical: "https://corretorortografico.online/privacidade" },
  openGraph: {
    type: "website",
    url: "https://corretorortografico.online/privacidade",
    title: "Privacidade | CorretorOrtografico.online",
    description:
      "Informações sobre rascunhos locais, revisão de textos, exportação em PDF e estatísticas de visitas.",
    siteName: "CorretorOrtografico.online",
    locale: "pt_BR",
  },
};

export default function PrivacyPage() {
  return (
    <SiteInfoPage
      title="Privacidade"
      description="Esta página explica o que acontece com os dados durante o uso do CorretorOrtografico.online."
    >
      <p className="text-sm text-slate-500">
        Atualizado em 24 de outubro de 2026.
      </p>

      <section aria-labelledby="responsavel">
        <h2
          id="responsavel"
          className="text-xl font-semibold text-slate-900"
        >
          Sobre esta informação
        </h2>
        <p className="mt-3">
          O serviço é apresentado sob a marca CorretorOrtografico.online. Para
          dúvidas ou solicitações relacionadas a dados pessoais, entre em
          contato pelo e-mail{" "}
          <a
            href="mailto:contato@corretorortografico.online"
            className="font-semibold text-blue-700 underline underline-offset-4"
          >
            contato@corretorortografico.online
          </a>
          .
        </p>
      </section>

      <section aria-labelledby="rascunhos-locais">
        <h2
          id="rascunhos-locais"
          className="text-xl font-semibold text-slate-900"
        >
          Rascunhos e configurações do editor
        </h2>
        <p className="mt-3">
          Os documentos e algumas preferências do editor são salvos no
          armazenamento local do navegador. Eles não são sincronizados com uma
          conta ou banco de dados do site. O conteúdo permanece nesse navegador
          até ser removido pelo usuário ou pelos controles de armazenamento do
          navegador. Ao limpar esses dados, os rascunhos salvos podem ser
          apagados.
        </p>
      </section>

      <section aria-labelledby="revisao">
        <h2 id="revisao" className="text-xl font-semibold text-slate-900">
          Revisão com LanguageTool
        </h2>
        <p className="mt-3">
          Quando você solicita uma análise, o texto é enviado ao endpoint do
          site `/api/languagetool`, que o encaminha a um serviço LanguageTool
          configurado. O endpoint também usa o endereço IP recebido na
          requisição para limitar o volume de solicitações; os contadores desse
          limite ficam na memória do processo. O texto precisa ser processado
          pelo serviço de revisão para que as sugestões sejam retornadas. O
          CorretorOrtografico.online não controla as políticas de retenção do
          operador desse serviço.
        </p>
      </section>

      <section aria-labelledby="pdf">
        <h2 id="pdf" className="text-xl font-semibold text-slate-900">
          Exportação em PDF
        </h2>
        <p className="mt-3">
          Se você escolher exportar em PDF, o conteúdo HTML do documento é
          enviado ao serviço de conversão configurado para gerar o arquivo. O
          envio acontece após essa ação. As práticas de registro e retenção do
          serviço dependem de quem o opera e de sua configuração.
        </p>
      </section>

      <section aria-labelledby="analytics">
        <h2
          id="analytics"
          className="text-xl font-semibold text-slate-900"
        >
          Estatísticas de visitas
        </h2>
        <p className="mt-3">
          O site utiliza um serviço de estatísticas para medir visitas. As
          páginas acessadas são contabilizadas sem os parâmetros e fragmentos da
          URL. Como em outras conexões à internet, o serviço pode receber dados
          técnicos da conexão, como endereço IP e navegador. O código do site
          não envia o texto digitado nem o título do rascunho para essa medição.
        </p>
      </section>

      <section aria-labelledby="servicos">
        <h2 id="servicos" className="text-xl font-semibold text-slate-900">
          Serviços externos
        </h2>
        <p className="mt-3">
          A revisão e a conversão em PDF dependem de serviços externos. Cada
          serviço recebe os dados necessários à função que você escolheu e
          pode aplicar seus próprios registros, prazos de retenção e regras de
          privacidade. Consulte as informações do operador do serviço para
          conhecer essas práticas.
        </p>
      </section>

      <section aria-labelledby="controle">
        <h2 id="controle" className="text-xl font-semibold text-slate-900">
          Como controlar seus dados
        </h2>
        <p className="mt-3">
          Você pode excluir rascunhos pela própria ferramenta ou limpar os
          dados locais do navegador. Para dúvidas ou solicitações sobre dados
          tratados pelo site, entre em contato pelo endereço acima. Os dados
          enviados a serviços externos também podem estar sujeitos às práticas
          desses serviços.
        </p>
        <p className="mt-3">
          Conforme a legislação aplicável, você também pode solicitar
          confirmação de tratamento, acesso, correção e outras providências
          previstas para seus dados pessoais. Consulte os{" "}
          <a
            href="https://www.gov.br/anpd/pt-br/assuntos/titular-de-dados/direito-dos-titulares"
            className="font-semibold text-blue-700 underline underline-offset-4"
          >
            direitos dos titulares explicados pela ANPD
          </a>
          .
        </p>
      </section>

      <p>
        <Link
          href="/"
          className="font-semibold text-blue-700 underline underline-offset-4"
        >
          Voltar ao corretor ortográfico
        </Link>
      </p>
    </SiteInfoPage>
  );
}
