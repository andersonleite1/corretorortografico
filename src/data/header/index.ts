import { i18n, Locale } from "../../../i18n-config";
import en from "./en";
import es from "./es";
import pt from "./pt";
import { HeaderContent } from "./types";

const contentMap: Record<Locale, HeaderContent> = {
  pt,
  en,
  es,
};

export function getHeaderContent(locale: string): HeaderContent {
  const normalized = (locale ?? i18n.defaultLocale) as Locale;
  if (contentMap[normalized]) {
    return contentMap[normalized];
  }

  return contentMap[i18n.defaultLocale];
}

export type { HeaderContent } from "./types";
