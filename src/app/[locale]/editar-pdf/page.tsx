import { Metadata } from "next";
import { notFound } from "next/navigation";

import EditarPdfClient from "./EditarPdfClient";
import { buildPdfEditorMetadata, getPdfEditorContent } from "@/data/pages/pdfEditor";
import { i18n, Locale } from "../../../../i18n-config";

type PageParams = {
  params: { locale: Locale };
};

export function generateStaticParams() {
  return i18n.locales.map((locale) => ({ locale }));
}

export function generateMetadata({ params }: PageParams): Metadata {
  if (!i18n.locales.includes(params.locale)) {
    return buildPdfEditorMetadata(i18n.defaultLocale);
  }

  return buildPdfEditorMetadata(params.locale);
}

export default function EditarPdfPage({ params }: PageParams) {
  const { locale } = params;

  if (!i18n.locales.includes(locale)) {
    notFound();
  }

  const content = getPdfEditorContent(locale);
  const homeHref = locale === i18n.defaultLocale ? "/" : `/${locale}`;

  return <EditarPdfClient content={content} homeHref={homeHref} />;
}
