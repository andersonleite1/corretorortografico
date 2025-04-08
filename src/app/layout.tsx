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
  title: "Editor de Texto Online",
  description:
    "A modern WYSIWYG rich text editor based on tiptap and shadcn ui for ReactJs/NextJs",
  keywords: "Tiptap, WYSIWYG, Rich Text Editor, ReactJS, NextJS",
  metadataBase: new URL(`https://editordetexto.online`),
  openGraph: {
    type: "website",
    url: `https://editordetexto.online`,
    title: "Editor de Texto Online",
    description:
      "A modern WYSIWYG rich text editor based on tiptap and shadcn ui for ReactJs/NextJs",
    siteName: "Editor de Texto Online",
    locale: "pt_BR",
    images: "/opengraph-image.jpg",
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
