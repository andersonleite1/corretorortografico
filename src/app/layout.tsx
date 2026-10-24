import type { Metadata, Viewport } from "next";
import Script from "next/script";
import localFont from "next/font/local";
import EditorShellProviders from "@/components/providers/EditorShellProviders";
import "@/styles/globals.scss";

const fontSans = localFont({
  src: "../../public/fonts/open-sans-latin-400-normal.woff2",
  variable: "--font-sans",
  display: "swap",
});
const fontMono = localFont({
  src: "../../public/fonts/jetbrains-mono-latin-400-normal.woff2",
  variable: "--font-mono",
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL("https://corretorortografico.online"),
  title: "Corretor Ortográfico Online",
  description:
    "Use um corretor ortográfico online com sugestões de ortografia, gramática e estilo pelo LanguageTool.",
  icons: { icon: "/icon.svg" },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION?.trim() || undefined,
    other: process.env.BING_SITE_VERIFICATION?.trim()
      ? { "msvalidate.01": process.env.BING_SITE_VERIFICATION.trim() }
      : undefined,
  },
};

export const viewport: Viewport = {
  themeColor: "#2563eb",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={`${fontSans.variable} ${fontMono.variable}`}>
      <head>
        <Script
          id="umami-analytics"
          src="https://umami.andersonleite.dev.br/script.js"
          data-website-id="2da7b158-1b49-4e89-8cc9-4d1d85485c37"
          data-domains="corretorortografico.online"
          data-exclude-search="true"
          data-exclude-hash="true"
          strategy="beforeInteractive"
        />
      </head>
      <body>
        <EditorShellProviders>{children}</EditorShellProviders>
      </body>
    </html>
  );
}
