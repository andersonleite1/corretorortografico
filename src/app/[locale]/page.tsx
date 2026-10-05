import { Metadata } from "next";
import { notFound } from "next/navigation";

import EditPageContent from "./EditPageContent";
import {
  buildHomeMetadata,
  getHomeContent,
  getHomeWebsiteSchema,
} from "@/data/home";
import { i18n, Locale } from "../../../i18n-config";

export function generateStaticParams() {
  return i18n.locales.map((locale) => ({ locale }));
}

type Props = {
  params: { locale: Locale };
};

export function generateMetadata({ params }: Props): Metadata {
  if (!i18n.locales.includes(params.locale)) {
    return buildHomeMetadata(i18n.defaultLocale);
  }

  return buildHomeMetadata(params.locale);
}

export default async function LocaleHomePage({ params }: Props) {
  const { locale } = params;

  if (!i18n.locales.includes(locale)) {
    notFound();
  }

  const content = getHomeContent(locale);
  const userPlan = "free";

  return (
    <div className="px-3 py-6 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(getHomeWebsiteSchema(locale)).replace(
            /</g,
            "\\u003c",
          ),
        }}
      />
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 xl:flex-row">
        <div className="flex w-full justify-center">
          <div className="flex w-full flex-col items-center gap-6">
            <EditPageContent content={content} userPlan={userPlan} />
          </div>
        </div>
      </div>
    </div>
  );
}
