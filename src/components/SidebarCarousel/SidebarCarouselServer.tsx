import {fetchMercadoLivreProducts} from "@/services/productMetadata";
import {SidebarCarousel} from "./SidebarCarousel";

interface SidebarCarouselServerProps {
  orientation?: "vertical" | "horizontal";
  className?: string;
  category?: string;
  autoplayDelayOffset?: number;
}

export async function SidebarCarouselServer({
  orientation,
  className,
  category,
  autoplayDelayOffset,
}: SidebarCarouselServerProps) {
  const products = await fetchMercadoLivreProducts();
  const filteredProducts = category
    ? products.filter((product) => product.category === category)
    : products;

  if (!filteredProducts.length) {
    return null;
  }

  return (
    <SidebarCarousel
      products={filteredProducts}
      orientation={orientation}
      className={className}
      autoplayDelayOffset={autoplayDelayOffset}
    />
  );
}
