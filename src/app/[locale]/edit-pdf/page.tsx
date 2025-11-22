import {Metadata} from "next";
import {notFound} from "next/navigation";

import {PdfEditorPageContent} from "../editar-pdf/page";
import {buildPdfEditorMetadata} from "@/data/pages/pdfEditor";
import {Locale} from "../../../../i18n-config";

const PDF_EDITOR_EN_LOCALE: Locale[] = ["en"];

type PageParams = {
  params: {locale: Locale};
};

export function generateStaticParams() {
  return PDF_EDITOR_EN_LOCALE.map((locale) => ({locale}));
}

export function generateMetadata({params}: PageParams): Metadata {
  const locale = PDF_EDITOR_EN_LOCALE.includes(params.locale)
    ? params.locale
    : PDF_EDITOR_EN_LOCALE[0];

  return buildPdfEditorMetadata(locale);
}

export default function PdfEditorEnPage({params}: PageParams) {
  const {locale} = params;

  if (!PDF_EDITOR_EN_LOCALE.includes(locale)) {
    notFound();
  }

  return <PdfEditorPageContent locale={locale} />;
}
