import EditarPdfClient from "./EditarPdfClient";
import {getPdfEditorContent} from "@/data/pages/pdfEditor";
import {i18n, Locale} from "../../../../i18n-config";

type PdfEditorPageContentProps = {
  locale: Locale;
};

export default function PdfEditorPageContent({locale}: PdfEditorPageContentProps) {
  const content = getPdfEditorContent(locale);
  const homeHref = locale === i18n.defaultLocale ? "/" : `/${locale}`;

  return <EditarPdfClient content={content} homeHref={homeHref} />;
}
