import Image from "next/image";
import { Metadata } from "next";
import { notFound } from "next/navigation";

import EditPageContent from "../(edit)/EditPageContent";
import { SidebarCarouselServer } from "@/components/SidebarCarousel/SidebarCarouselServer";
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
    <div className="px-3 py-6 sm:px-6">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 xl:flex-row">
        <div className="flex w-full justify-center">
          <EditPageContent content={content} />
        </div>
        <aside className="hidden w-full max-w-xs flex-shrink-0 xl:block">
          <div className="sticky top-6 flex flex-col gap-4">
            <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
              <Image
                src="/banner-meli.jpg"
                alt="Promoções Mercado Livre"
                width={320}
                height={180}
                className="h-auto w-full object-cover"
                priority
              />
            </div>
            <SidebarCarouselServer className="w-full" />
          </div>
        </aside>
      </div>
    </div>
  );
}
