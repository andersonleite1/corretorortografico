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
import { getUserPlan } from "@/lib/auth";

import "@/styles/globals.scss";
import { getHomeFaqSchema, getHomeWebAppSchema } from "@/data/home";
import { i18n, Locale } from "../../i18n-config";
import { MainContent } from "./MainContent";
import { Toaster } from "sonner";

import { CookieConsent } from "@/components/shared/CookieConsent";
import { Analytics } from "@/components/shared/Analytics";

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
  const cookieConsentGiven = cookieStore.get("cookie_consent")?.value === "true";
  const webAppSchema = getHomeWebAppSchema(locale);

  // Sincroniza o usuário com o banco de dados (Fallback)
  // Removido o await para não bloquear o rendering inicial do layout
  syncUserWithDb();

  const userPlan = await getUserPlan();

  return (
    <html lang={locale} className={`${fontMono.variable} ${fontSans.variable}`}>
      <head>
        <link rel="preconnect" href="https://www.clarity.ms" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }}
        />
      </head>
      <body>
        <ClerkThemeProvider locale={locale}>
          <SidebarProvider>
            <Analytics />
            <MainContent
              userButton={<UserButton locale={locale} />}
              locale={locale}
              userPlan={userPlan}
            >
              {children}
            </MainContent>
            <Toaster richColors position="top-right" />
            {!cookieConsentGiven && <CookieConsent locale={locale} />}
          </SidebarProvider>
        </ClerkThemeProvider>
      </body>
    </html>
  );
}
