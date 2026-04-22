import { JetBrains_Mono, Open_Sans } from "next/font/google";
import { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import dynamic from "next/dynamic";

const fontMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});
const fontSans = Open_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

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
import { PlanProvider, Plan } from "@/components/providers/PlanProvider";

const CookieConsent = dynamic(
  () => import("@/components/shared/CookieConsent").then((mod) => mod.CookieConsent),
  { ssr: false }
);
import { Analytics } from "@/components/shared/Analytics";

export const viewport: Viewport = {
  themeColor: "#2563eb",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
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
  const userPlan = (cookieStore.get("user_plan")?.value as Plan) || "free";
  const cookieConsentGiven = cookieStore.get("cookie_consent")?.value === "true";
  const webAppSchema = getHomeWebAppSchema(locale);

  return (
    <html lang={locale} className={`${fontMono.variable} ${fontSans.variable}`}>
      <head>
        <link rel="preconnect" href="https://www.clarity.ms" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Preload background image so browser fetches it in parallel with CSS parsing */}
        <link rel="preload" as="image" href="/background.webp" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }}
        />
      </head>
      <body>
        <ClerkThemeProvider locale={locale}>
          <PlanProvider initialPlan={userPlan}>
            <SidebarProvider>
              <Analytics />
              <MainContent
                userButton={<UserButton locale={locale} />}
                locale={locale}
              >
                {children}
              </MainContent>
              <Toaster richColors position="top-right" />
              {!cookieConsentGiven && <CookieConsent locale={locale} />}
            </SidebarProvider>
          </PlanProvider>
        </ClerkThemeProvider>
      </body>
    </html>
  );
}
