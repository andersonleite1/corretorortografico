import { JetBrains_Mono, Open_Sans } from "next/font/google";
import { Metadata } from "next";
import { cookies } from "next/headers";

const fontMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});
const fontSans = Open_Sans({ subsets: ["latin"], variable: "--font-sans" });

import { UserButton } from "@/components/shared/UserButton";
import { ClerkThemeProvider } from "@/components/providers/ClerkThemeProvider";
import { SidebarProvider } from "@/components/providers/SidebarProvider";
import { syncUserWithDb } from "@/lib/sync-user";

import "@/styles/globals.scss";
import Head from "next/head";
import Script from "next/script";
import { getHomeFaqSchema } from "@/data/home";
import { i18n, Locale } from "../../i18n-config";
import { MainContent } from "./MainContent";
import { Toaster } from "sonner";

import { CookieConsent } from "@/components/shared/CookieConsent";

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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = cookies();
  const storedLocale = cookieStore.get("NEXT_LOCALE")?.value as
    | Locale
    | undefined;
  const locale =
    storedLocale && i18n.locales.includes(storedLocale)
      ? storedLocale
      : i18n.defaultLocale;
  const faqSchema = getHomeFaqSchema(locale);

  // Sincroniza o usuário com o banco de dados (Fallback)
  // Removido o await para não bloquear o rendering inicial do layout
  syncUserWithDb();

  return (
    <ClerkThemeProvider locale={locale}>
      <SidebarProvider>
        <html
          lang={locale}
          className={`${fontMono.variable} ${fontSans.variable}`}
        >
          <Head>
            <link
              rel="preconnect"
              href="https://www.clarity.ms"
              crossOrigin=""
            />
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
              {JSON.stringify(faqSchema)}
            </script>
          </Head>
          <body>
            <Script
              src="https://www.googletagmanager.com/gtag/js?id=G-XFE7CNSV4S"
              strategy="lazyOnload"
            />
            <Script id="google-analytics" strategy="lazyOnload">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', 'G-XFE7CNSV4S');
              `}
            </Script>
            <Script
              id="ms-clarity"
              strategy="lazyOnload"
              dangerouslySetInnerHTML={{
                __html: `(function(c,l,a,r,i,t,y){
                  c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                  t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i+"?ref=bwt";
                  y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
                })(window, document, "clarity", "script", "sc6j3d7url");`,
              }}
            />
            <MainContent userButton={<UserButton />} locale={locale}>
              {children}
            </MainContent>
            <Toaster richColors position="top-right" />
            <CookieConsent locale={locale} />
          </body>
        </html>
      </SidebarProvider>
    </ClerkThemeProvider>
  );
}
