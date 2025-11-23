import {Metadata} from "next";
import {notFound} from "next/navigation";

import ContactPageContent from "./ContactPageContent";
import {buildContactMetadata} from "@/data/pages/contact";
import {i18n, Locale} from "../../../../i18n-config";

const CONTACT_SUPPORTED_LOCALES: Locale[] = ["pt", "es"];

type PageParams = {
  params: {locale: Locale};
};

export function generateStaticParams() {
  return CONTACT_SUPPORTED_LOCALES.map((locale) => ({locale}));
}

export function generateMetadata({params}: PageParams): Metadata {
  const locale = CONTACT_SUPPORTED_LOCALES.includes(params.locale)
    ? params.locale
    : i18n.defaultLocale;

  return buildContactMetadata(locale);
}

export default function ContactPage({params}: PageParams) {
  const {locale} = params;

  if (!CONTACT_SUPPORTED_LOCALES.includes(locale)) {
    notFound();
  }

  return <ContactPageContent locale={locale} />;
}
