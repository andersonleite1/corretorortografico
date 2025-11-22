import {Metadata} from "next";
import {notFound} from "next/navigation";

import {AboutPageContent} from "../sobre/page";
import {buildAboutMetadata} from "@/data/pages/about";
import {Locale} from "../../../../i18n-config";

const ABOUT_EN_LOCALE: Locale[] = ["en"];

type PageParams = {
  params: {locale: Locale};
};

export function generateStaticParams() {
  return ABOUT_EN_LOCALE.map((locale) => ({locale}));
}

export function generateMetadata({params}: PageParams): Metadata {
  const locale = ABOUT_EN_LOCALE.includes(params.locale)
    ? params.locale
    : ABOUT_EN_LOCALE[0];

  return buildAboutMetadata(locale);
}

export default function AboutEnPage({params}: PageParams) {
  const {locale} = params;

  if (!ABOUT_EN_LOCALE.includes(locale)) {
    notFound();
  }

  return <AboutPageContent locale={locale} />;
}
