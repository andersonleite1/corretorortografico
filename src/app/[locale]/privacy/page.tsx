import {Metadata} from "next";
import {notFound} from "next/navigation";

import {PrivacyPageContent} from "../privacidade/page";
import {buildPrivacyMetadata} from "@/data/pages/privacy";
import {Locale} from "../../../../i18n-config";

const PRIVACY_EN_LOCALE: Locale[] = ["en"];

type PageParams = {
  params: {locale: Locale};
};

export function generateStaticParams() {
  return PRIVACY_EN_LOCALE.map((locale) => ({locale}));
}

export function generateMetadata({params}: PageParams): Metadata {
  const locale = PRIVACY_EN_LOCALE.includes(params.locale)
    ? params.locale
    : PRIVACY_EN_LOCALE[0];

  return buildPrivacyMetadata(locale);
}

export default function PrivacyEnPage({params}: PageParams) {
  const {locale} = params;

  if (!PRIVACY_EN_LOCALE.includes(locale)) {
    notFound();
  }

  return <PrivacyPageContent locale={locale} />;
}
