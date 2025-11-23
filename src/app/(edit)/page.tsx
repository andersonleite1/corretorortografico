import EditPageContent from "./EditPageContent";
import { MercadoLivreProductsProvider } from "@/hooks/useMercadoLivreProducts";
import { buildHomeMetadata, getHomeContent } from "@/data/home";
import { fetchMercadoLivreProducts } from "@/services/productMetadata";
import { i18n } from "../../../i18n-config";

const defaultLocale = i18n.defaultLocale;

export const metadata = buildHomeMetadata(defaultLocale);

export default async function HomePage() {
  const content = getHomeContent(defaultLocale);
  const products = await fetchMercadoLivreProducts();
  return (
    <MercadoLivreProductsProvider initialProducts={products}>
      <EditPageContent content={content} />
    </MercadoLivreProductsProvider>
  );
}
