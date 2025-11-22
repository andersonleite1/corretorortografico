import {Metadata} from "next";
import {notFound} from "next/navigation";

import EditarPdfClient from "./EditarPdfClient";
import {buildPdfEditorMetadata, getPdfEditorContent} from "@/data/pages/pdfEditor";
import {i18n, Locale} from "../../../../i18n-config";

const PDF_EDITOR_SUPPORTED_LOCALES: Locale[] = ["pt", "es"];

type PageParams = {
  params: {locale: Locale};
};

export function generateStaticParams() {
  return PDF_EDITOR_SUPPORTED_LOCALES.map((locale) => ({locale}));
}

export function generateMetadata({params}: PageParams): Metadata {
  const locale = PDF_EDITOR_SUPPORTED_LOCALES.includes(params.locale)
    ? params.locale
    : i18n.defaultLocale;

  return buildPdfEditorMetadata(locale);
}

type PdfEditorPageContentProps = {
  locale: Locale;
};

export function PdfEditorPageContent({locale}: PdfEditorPageContentProps) {
  const content = getPdfEditorContent(locale);
  const homeHref = locale === i18n.defaultLocale ? "/" : `/${locale}`;

  return <EditarPdfClient content={content} homeHref={homeHref} />;
}

export default function EditarPdfPage({params}: PageParams) {
  const {locale} = params;

  if (!PDF_EDITOR_SUPPORTED_LOCALES.includes(locale)) {
    notFound();
  }

  return <PdfEditorPageContent locale={locale} />;
}
