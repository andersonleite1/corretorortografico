import { Metadata } from "next";

import { i18n, Locale } from "../../../i18n-config";
import en from "./en";
import es from "./es";
import pt from "./pt";
import { HomeContent } from "./types";

const contentMap: Record<Locale, HomeContent> = {
  pt,
  en,
  es,
};

export function getHomeContent(locale: string): HomeContent {
  const normalized = (locale ?? i18n.defaultLocale) as Locale;
  if (contentMap[normalized]) {
    return contentMap[normalized];
  }

  return contentMap[i18n.defaultLocale];
}

export function getHomeFaqSchema(locale: string) {
  const { faq } = getHomeContent(locale);
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

export function getHomeSeo(locale: string) {
  const { seo } = getHomeContent(locale);
  const keywords = seo.keywords.join(", ");
  return {
    title: seo.title,
    description: seo.description,
    keywords,
    openGraphTitle: seo.openGraphTitle ?? seo.title,
    openGraphDescription: seo.openGraphDescription ?? seo.description,
  };
}

export function buildHomeMetadata(locale: string): Metadata {
  const seo = getHomeSeo(locale);
  return {
    title: seo.title,
    description: seo.description,
    keywords: seo.keywords,
    openGraph: {
      type: "website",
      url: "https://editordetexto.online",
      title: seo.openGraphTitle,
      description: seo.openGraphDescription,
      siteName: "Editor de Texto Online",
    },
  };
}

export type { HomeContent } from "./types";
