import type { MetadataRoute } from "next";

import { i18n, type Locale } from "../../i18n-config";

const baseUrl = "https://editordetexto.online";
const defaultLocale = i18n.defaultLocale;

type LocalizedRoute = {
  priority: number;
  changeFrequency?: MetadataRoute.Sitemap[0]["changeFrequency"];
  paths: Partial<Record<Locale, string>>;
};

const localizedRoutes: LocalizedRoute[] = [
  {
    priority: 1,
    changeFrequency: "weekly",
    paths: {
      pt: "/",
      en: "/en",
      es: "/es",
    },
  },
  {
    priority: 0.7,
    changeFrequency: "weekly",
    paths: {
      pt: "/about",
      es: "/es/about",
      en: "/en/about",
    },
  },
  {
    priority: 0.65,
    changeFrequency: "weekly",
    paths: {
      pt: "/contact",
      es: "/es/contact",
      en: "/en/contact",
    },
  },
  {
    priority: 0.6,
    changeFrequency: "weekly",
    paths: {
      pt: "/privacy",
      es: "/es/privacy",
      en: "/en/privacy",
    },
  },
  {
    priority: 0.6,
    changeFrequency: "weekly",
    paths: {
      pt: "/terms",
      es: "/es/terms",
      en: "/en/terms",
    },
  },
];

const toAbsoluteUrl = (path: string) => `${baseUrl}${path}`;

const buildAlternates = (paths: LocalizedRoute["paths"]) => {
  const entries = Object.entries(paths).filter(
    (entry): entry is [Locale, string] => Boolean(entry[1])
  );

  if (entries.length <= 1) {
    return undefined;
  }

  const languages: Record<string, string> = {};

  entries.forEach(([locale, path]) => {
    const absoluteUrl = toAbsoluteUrl(path);
    languages[locale] = absoluteUrl;

    if (locale === defaultLocale) {
      languages["x-default"] = absoluteUrl;
    }
  });

  if (!languages["x-default"] && entries[0]) {
    languages["x-default"] = toAbsoluteUrl(entries[0][1]);
  }

  return languages;
};

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return localizedRoutes.flatMap(({ paths, priority, changeFrequency }) => {
    const alternates = buildAlternates(paths);

    return Object.values(paths)
      .filter((path): path is string => Boolean(path))
      .map((path) => ({
        url: toAbsoluteUrl(path),
        lastModified,
        priority,
        changeFrequency,
        ...(alternates && { alternates: { languages: alternates } }),
      }));
  });
}
