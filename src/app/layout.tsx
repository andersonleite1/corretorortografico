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
    images: "/editor-de-texto.png",
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
      </Head>
      <body>
        <Header />
        <main>{children}</main>
        <Analytics />
        <SpeedInsights />
        <Analytics />
        <footer className="bg-gray-900 text-white py-8 mt-8">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-lg">
              Feito com <span className="text-red-500">💚</span> por{" "}
              <strong>editordetexto.online</strong>
            </p>
            <p className="text-sm mt-2 text-gray-400">
              &copy; {new Date().getFullYear()} Editor de Texto Online. Todos os
              direitos reservados.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
