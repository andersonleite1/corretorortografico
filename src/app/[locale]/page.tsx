import { Metadata } from "next";
import { notFound } from "next/navigation";

import EditPageContent from "../(edit)/EditPageContent";
import { buildHomeMetadata, getHomeContent } from "@/data/home";
import { i18n, Locale } from "../../../i18n-config";

export function generateStaticParams() {
  return i18n.locales.map((locale) => ({ locale }));
}

type Props = {
  params: { locale: Locale };
};

export function generateMetadata({ params }: Props): Metadata {
  if (!i18n.locales.includes(params.locale)) {
    return buildHomeMetadata(i18n.defaultLocale);
  }

  return buildHomeMetadata(params.locale);
}

export default function LocaleHomePage({ params }: Props) {
  const { locale } = params;

  if (!i18n.locales.includes(locale)) {
    notFound();
  }

  const content = getHomeContent(locale);

  return <EditPageContent content={content} />;
}
