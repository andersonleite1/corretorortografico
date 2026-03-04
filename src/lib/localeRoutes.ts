import { i18n, type Locale } from "../../i18n-config";

const routeSlugMap = {
  about: {
    pt: "sobre",
    en: "about",
    es: "sobre",
  },
  contact: {
    pt: "contato",
    en: "contact",
    es: "contato",
  },
  privacy: {
    pt: "privacidade",
    en: "privacy",
    es: "privacidade",
  },
  terms: {
    pt: "termos",
    en: "terms",
    es: "termos",
  },
} as const;

export type RouteKey = keyof typeof routeSlugMap;

const getNormalizedLocale = (locale: Locale) =>
  (i18n.locales.includes(locale) ? locale : i18n.defaultLocale) as Locale;

export function getRouteSlug(route: RouteKey, locale: Locale): string {
  const normalized = getNormalizedLocale(locale);
  const slugs = routeSlugMap[route];

  return slugs[normalized] ?? slugs[i18n.defaultLocale];
}

export function getRouteHref(route: RouteKey, locale: Locale): string {
  const normalized = getNormalizedLocale(locale);
  const slug = getRouteSlug(route, normalized);
  const prefix = normalized === i18n.defaultLocale ? "" : `/${normalized}`;

  return `${prefix}/${slug}`;
}
