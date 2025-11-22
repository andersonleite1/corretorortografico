import {Metadata} from "next";
import {notFound} from "next/navigation";

import {ContactPageContent} from "../contato/page";
import {buildContactMetadata} from "@/data/pages/contact";
import {Locale} from "../../../../i18n-config";

const CONTACT_EN_LOCALE: Locale[] = ["en"];

type PageParams = {
  params: {locale: Locale};
};

export function generateStaticParams() {
  return CONTACT_EN_LOCALE.map((locale) => ({locale}));
}

export function generateMetadata({params}: PageParams): Metadata {
  const locale = CONTACT_EN_LOCALE.includes(params.locale)
    ? params.locale
    : CONTACT_EN_LOCALE[0];

  return buildContactMetadata(locale);
}

export default function ContactEnPage({params}: PageParams) {
  const {locale} = params;

  if (!CONTACT_EN_LOCALE.includes(locale)) {
    notFound();
  }

  return <ContactPageContent locale={locale} />;
}
