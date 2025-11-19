import { JetBrains_Mono, Open_Sans } from "next/font/google";
import { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/next"

const fontMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});
const fontSans = Open_Sans({ subsets: ["latin"], variable: "--font-sans" });

import Header from "@/components/shared/Header";

import "@/styles/globals.scss";
import Head from "next/head";
import Script from "next/script";
import Footer from "@/components/Footer/footer";

export const metadata: Metadata = {
  title: "Editor de Texto Online Grátis e Simples | EditorDeTexto.online",
  description:
    "Use um editor de texto online gratuito, leve e sem anúncios. Escreva, edite e copie seus textos com facilidade, direto do navegador. Ideal para redatores, estudantes e profissionais.",
  keywords:
    "editor de texto online, editor de texto gratuito, escrever texto online, editor simples, produção de texto, editor leve, editor sem login",
  metadataBase: new URL("https://editordetexto.online"),
  openGraph: {
    type: "website",
    url: "https://editordetexto.online",
    title: "Editor de Texto Online Grátis e Simples | EditorDeTexto.online",
    description:
      "Escreva seus textos com facilidade usando um editor de texto online gratuito e direto no navegador. Rápido, leve e sem distrações.",
    siteName: "Editor de Texto Online",
    locale: "pt_BR",
    images: "/editor-de-texto.webp",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${fontMono.variable} ${fontSans.variable}`}>
      <Head>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Editor de Texto Online",
            url: "https://editordetexto.online",
            description:
              "O Editor de Texto Online é uma ferramenta gratuita para criar, editar e exportar textos de forma prática e eficiente. Ideal para estudantes, profissionais e escritores casuais.",
            applicationCategory: "Utility",
            operatingSystem: "All",
            creator: {
              "@type": "Organization",
              name: "Editor de Texto Online",
            },
            featureList: [
              "Edição de texto avançada",
              "Exportação para PDF e DOCX",
              "Interface minimalista e intuitiva",
              "Compatível com dispositivos móveis",
            ],
            keywords: [
              "editor de texto online",
              "escrever textos online",
              "ferramenta gratuita para textos",
              "exportar textos para PDF",
              "editor de documentos online",
            ],
          })}
        </script>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: "O que é um editor de texto?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text:
                    "Um editor de texto é uma ferramenta essencial voltada para a criação e manipulação de arquivos de texto simples (plain text). Diferente de processadores complexos, o foco aqui é a agilidade e a limpeza do código ou da escrita. Nosso editor de texto online permite que você digite, copie, cole e formate suas ideias instantaneamente, funcionando como um bloco de notas digital aprimorado, sem a necessidade de baixar programas pesados.",
                },
              },
              {
                "@type": "Question",
                name: "Qual a diferença entre um editor de texto e o Word?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text:
                    "O Word é um processador de documentos focado em layouts complexos para impressão. Já um editor de texto puro foca no conteúdo. Ele é mais leve, carrega mais rápido e é ideal para rascunhos, anotações rápidas, limpeza de formatação ou códigos de programação. Se você precisa apenas escrever ou editar texto sem distrações e menus complicados, esta ferramenta online é a melhor escolha.",
                },
              },
              {
                "@type": "Question",
                name: "Este editor de texto é gratuito?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text:
                    "Sim, o editordetexto.online é uma ferramenta 100% gratuita. Nossa missão é oferecer um editor de texto simples e acessível a qualquer momento. Você pode utilizar todos os recursos de contagem de caracteres, formatação básica e download do arquivo sem pagar nada e sem precisar fazer cadastro.",
                },
              },
              {
                "@type": "Question",
                name: "Posso usar este editor de texto no celular?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text:
                    "Com certeza. Nossa plataforma foi otimizada para funcionar perfeitamente como um editor de texto mobile. Seja no Android ou no iPhone (iOS), você consegue digitar suas notas, listas ou textos acadêmicos diretamente pelo navegador do celular, com a mesma eficiência de um aplicativo, mas sem ocupar memória do seu aparelho.",
                },
              },
            ],
          })}
        </script>
      </Head>
      <body>
        <Script
            src="https://www.googletagmanager.com/gtag/js?id=G-XFE7CNSV4S"
            strategy="afterInteractive"
          />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-XFE7CNSV4S');
          `}
        </Script>
        <Script
          id="ms-clarity"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(c,l,a,r,i,t,y){
              c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
              t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i+"?ref=bwt";
              y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "sc6j3d7url");`,
          }}
        />
        <Header />
        <main>{children}</main>
        <SpeedInsights />
        <Analytics />
        <Footer />
      </body>
    </html>
  );
}
