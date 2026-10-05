import { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import localFont from "next/font/local";
import Script from "next/script";

const fontMono = localFont({
  src: [
    {
      path: "../../public/fonts/jetbrains-mono-latin-100-normal.woff2",
      weight: "100",
      style: "normal",
    },
    {
      path: "../../public/fonts/jetbrains-mono-latin-200-normal.woff2",
      weight: "200",
      style: "normal",
    },
    {
      path: "../../public/fonts/jetbrains-mono-latin-300-normal.woff2",
      weight: "300",
      style: "normal",
    },
    {
      path: "../../public/fonts/jetbrains-mono-latin-400-normal.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/jetbrains-mono-latin-500-normal.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../public/fonts/jetbrains-mono-latin-600-normal.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "../../public/fonts/jetbrains-mono-latin-700-normal.woff2",
      weight: "700",
      style: "normal",
    },
    {
      path: "../../public/fonts/jetbrains-mono-latin-800-normal.woff2",
      weight: "800",
      style: "normal",
    },
  ],
  variable: "--font-mono",
  display: "swap",
  preload: false,
});
const fontSans = localFont({
  src: [
    {
      path: "../../public/fonts/open-sans-latin-300-normal.woff2",
      weight: "300",
      style: "normal",
    },
    {
      path: "../../public/fonts/open-sans-latin-400-normal.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/open-sans-latin-500-normal.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../public/fonts/open-sans-latin-600-normal.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "../../public/fonts/open-sans-latin-700-normal.woff2",
      weight: "700",
      style: "normal",
    },
    {
      path: "../../public/fonts/open-sans-latin-800-normal.woff2",
      weight: "800",
      style: "normal",
    },
  ],
  variable: "--font-sans",
  display: "swap",
});

import { SidebarProvider } from "@/components/providers/SidebarProvider";

import "@/styles/globals.scss";
import { i18n, Locale } from "../../i18n-config";
import { MainContent } from "./MainContent";
import { Toaster } from "sonner";
import { PlanProvider } from "@/components/providers/PlanProvider";

import { CookieConsent } from "@/components/shared/CookieConsent";
import { Analytics } from "@/components/shared/Analytics";

export const viewport: Viewport = {
  themeColor: "#2563eb",
  width: "device-width",
  initialScale: 1,
};

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
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Editor",
  },
  other: {
    "mobile-web-app-capable": "yes",
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
  const cookieConsentGiven =
    cookieStore.get("cookie_consent")?.value === "true";

  return (
    <html lang={locale} className={`${fontMono.variable} ${fontSans.variable}`}>
      <head>
        <link rel="preconnect" href="https://www.clarity.ms" />
        {/* Preload background image so browser fetches it in parallel with CSS parsing */}
        <link rel="preload" as="image" href="/background.webp" />
        <Script
          src="https://analytics.editordetexto.cloud/script.js"
          data-website-id="05f767c0-1174-400e-b467-256e102036c3"
          strategy="afterInteractive"
        />
      </head>
      <body>
        <PlanProvider>
          <SidebarProvider>
            <Analytics />
            <MainContent locale={locale}>{children}</MainContent>
            <Toaster richColors position="top-right" />
            {!cookieConsentGiven && <CookieConsent locale={locale} />}
          </SidebarProvider>
        </PlanProvider>
      </body>
    </html>
  );
}
