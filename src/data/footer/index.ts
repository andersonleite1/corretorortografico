import { i18n, Locale } from "../../../i18n-config";
import en from "./en";
import es from "./es";
import pt from "./pt";
import { FooterContent } from "./types";

const footerContentMap: Record<Locale, FooterContent> = {
  pt,
  en,
  es,
};

export function getFooterContent(locale: string): FooterContent {
  const normalized = (locale ?? i18n.defaultLocale) as Locale;

  if (footerContentMap[normalized]) {
    return footerContentMap[normalized];
  }

  return footerContentMap[i18n.defaultLocale];
}

export type { FooterContent, FooterLink } from "./types";
