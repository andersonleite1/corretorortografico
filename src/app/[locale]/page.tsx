import Image from "next/image";
import { Metadata } from "next";
import { notFound } from "next/navigation";

import EditPageContent from "../(edit)/EditPageContent";
import { SidebarRecommendations } from "@/components/SidebarCarousel/SidebarRecommendations";
import { MercadoLivreProductsProvider } from "@/hooks/useMercadoLivreProducts";
import { buildHomeMetadata, getHomeContent } from "@/data/home";
import { i18n, Locale } from "../../../i18n-config";
import { fetchMercadoLivreProducts } from "@/services/productMetadata";

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
  const products = await fetchMercadoLivreProducts();
  return (
    <MercadoLivreProductsProvider initialProducts={products}>
      <div className="px-3 py-6 sm:px-6">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 xl:flex-row">
          <div className="flex w-full justify-center">
            <div className="flex w-full flex-col items-center gap-6">
              <EditPageContent content={content} />
            </div>
          </div>
          <aside className="hidden w-full max-w-xs flex-shrink-0 xl:block">
            <div className="sticky top-6 mt-10 flex flex-col gap-4">
              <div className="overflow-hidden rounded-[2rem] border border-slate-200 shadow-sm">
                <Image
                  src="/mercado_livre_azul_editado.png"
                  alt="Promoções Mercado Livre"
                  width={300}
                  height={120}
                  className="h-auto w-full object-cover"
                  priority
                />
              </div>
              <SidebarRecommendations />
            </div>
          </aside>
        </div>
      </div>
    </MercadoLivreProductsProvider>
  );
}
