import {Metadata} from "next";
import {notFound} from "next/navigation";

import PrivacyPageContent from "./PrivacyPageContent";
import {buildPrivacyMetadata} from "@/data/pages/privacy";
import {i18n, Locale} from "../../../../i18n-config";

const PRIVACY_SUPPORTED_LOCALES: Locale[] = ["pt", "es"];

type PageParams = {
  params: {locale: Locale};
};

export function generateStaticParams() {
  return PRIVACY_SUPPORTED_LOCALES.map((locale) => ({locale}));
}

export function generateMetadata({params}: PageParams): Metadata {
  const locale = PRIVACY_SUPPORTED_LOCALES.includes(params.locale)
    ? params.locale
    : i18n.defaultLocale;

  return buildPrivacyMetadata(locale);
}

export default function PrivacyPolicyPage({params}: PageParams) {
  const {locale} = params;

  if (!PRIVACY_SUPPORTED_LOCALES.includes(locale)) {
    notFound();
  }

  return <PrivacyPageContent locale={locale} />;
}
