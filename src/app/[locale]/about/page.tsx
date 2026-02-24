import { Metadata } from "next";
import { notFound } from "next/navigation";

import AboutPageContent from "./AboutPageContent";
import { buildAboutMetadata } from "@/data/pages/about";
import { i18n, Locale } from "../../../../i18n-config";

const ABOUT_SUPPORTED_LOCALES: readonly Locale[] = i18n.locales;

type PageParams = {
  params: { locale: Locale };
};

export function generateStaticParams() {
  return ABOUT_SUPPORTED_LOCALES.map((locale) => ({ locale }));
}

export function generateMetadata({ params }: PageParams): Metadata {
  const locale = ABOUT_SUPPORTED_LOCALES.includes(params.locale)
    ? params.locale
    : i18n.defaultLocale;

  return buildAboutMetadata(locale);
}

export default function AboutPage({ params }: PageParams) {
  const { locale } = params;

  if (!ABOUT_SUPPORTED_LOCALES.includes(locale)) {
    notFound();
  }

  return <AboutPageContent locale={locale} />;
}
