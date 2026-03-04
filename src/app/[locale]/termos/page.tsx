import { Metadata } from "next";
import { notFound } from "next/navigation";

import TermsPageContent from "./TermsPageContent";
import { buildTermsMetadata } from "@/data/pages/terms";
import { i18n, Locale } from "../../../../i18n-config";

const TERMS_SUPPORTED_LOCALES: readonly Locale[] = i18n.locales;

type PageParams = {
  params: { locale: Locale };
};

export function generateStaticParams() {
  return TERMS_SUPPORTED_LOCALES.map((locale) => ({ locale }));
}

export function generateMetadata({ params }: PageParams): Metadata {
  const locale = TERMS_SUPPORTED_LOCALES.includes(params.locale)
    ? params.locale
    : i18n.defaultLocale;

  return buildTermsMetadata(locale);
}

export default function TermsPage({ params }: PageParams) {
  const { locale } = params;

  if (!TERMS_SUPPORTED_LOCALES.includes(locale)) {
    notFound();
  }

  return <TermsPageContent locale={locale} />;
}
