import {Metadata} from "next";
import {notFound} from "next/navigation";

import {TermsPageContent} from "../termos/page";
import {buildTermsMetadata} from "@/data/pages/terms";
import {Locale} from "../../../../i18n-config";

const TERMS_EN_LOCALE: Locale[] = ["en"];

type PageParams = {
  params: {locale: Locale};
};

export function generateStaticParams() {
  return TERMS_EN_LOCALE.map((locale) => ({locale}));
}

export function generateMetadata({params}: PageParams): Metadata {
  const locale = TERMS_EN_LOCALE.includes(params.locale)
    ? params.locale
    : TERMS_EN_LOCALE[0];

  return buildTermsMetadata(locale);
}

export default function TermsEnPage({params}: PageParams) {
  const {locale} = params;

  if (!TERMS_EN_LOCALE.includes(locale)) {
    notFound();
  }

  return <TermsPageContent locale={locale} />;
}
