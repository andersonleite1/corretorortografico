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

const BASE_URL = "https://editordetexto.online";
const hrefLangMap: Record<Locale, string> = {
  pt: "pt-BR",
  en: "en",
  es: "es",
};

function getLocaleUrl(locale: Locale) {
  return locale === i18n.defaultLocale ? BASE_URL : `${BASE_URL}/${locale}`;
}

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

export function getHomeWebAppSchema(locale: string) {
  const { webAppSchema } = getHomeContent(locale);
  const normalizedLocale = (locale ?? i18n.defaultLocale) as Locale;
  const inLanguageMap: Record<Locale, string> = {
    pt: "pt-BR",
    en: "en",
    es: "es",
  };

  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: webAppSchema.name,
    url: getLocaleUrl(normalizedLocale),
    description: webAppSchema.description,
    inLanguage: inLanguageMap[normalizedLocale],
    applicationCategory: webAppSchema.applicationCategory,
    operatingSystem: "All",
    creator: {
      "@type": "Organization",
      name: "Editor de Texto Online",
    },
    featureList: webAppSchema.featureList,
    keywords: webAppSchema.keywords,
  };
}

export function buildHomeMetadata(locale: string): Metadata {
  const seo = getHomeSeo(locale);
  const normalizedLocale = (locale ?? i18n.defaultLocale) as Locale;
  const languages = Object.fromEntries(
    i18n.locales.map((loc) => [hrefLangMap[loc] ?? loc, getLocaleUrl(loc)]),
  );

  languages["x-default"] = BASE_URL;

  return {
    title: seo.title,
    description: seo.description,
    keywords: seo.keywords,
    openGraph: {
      type: "website",
      url: getLocaleUrl(normalizedLocale),
      title: seo.openGraphTitle,
      description: seo.openGraphDescription,
      siteName: "Editor de Texto Online",
    },
    alternates: {
      canonical: getLocaleUrl(normalizedLocale),
      languages,
    },
  };
}

export type { HomeContent } from "./types";
