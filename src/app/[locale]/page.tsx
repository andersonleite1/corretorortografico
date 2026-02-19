import Image from "next/image";
import { Metadata } from "next";
import { notFound } from "next/navigation";

import EditPageContent from "./EditPageContent";
import { MercadoLivreProductsProvider } from "@/hooks/useMercadoLivreProducts";
import { buildHomeMetadata, getHomeContent } from "@/data/home";
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

export default function LocaleHomePage({ params }: Props) {
  const { locale } = params;

  if (!i18n.locales.includes(locale)) {
    notFound();
  }

  const content = getHomeContent(locale);
  return (
    <MercadoLivreProductsProvider>
      <div className="px-3 py-6 sm:px-6">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 xl:flex-row">
          <div className="flex w-full justify-center">
            <div className="flex w-full flex-col items-center gap-6">
              <EditPageContent content={content} />
            </div>
          </div>
        </div>
      </div>
    </MercadoLivreProductsProvider>
  );
}
