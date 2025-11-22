import {
  fetchMercadoLivreProducts,
  type ProductData,
} from "@/services/productMetadata";
import {SidebarCarousel} from "./SidebarCarousel";

interface SidebarCarouselServerProps {
  orientation?: "vertical" | "horizontal";
  className?: string;
  category?: string;
  autoplayDelayOffset?: number;
  variant?: "default" | "mobile";
  products?: ProductData[];
}

export async function SidebarCarouselServer({
  orientation,
  className,
  category,
  autoplayDelayOffset,
  variant,
  products,
}: SidebarCarouselServerProps) {
  const data = products ?? (await fetchMercadoLivreProducts());
  const normalizedCategory = category?.toUpperCase();
  const filteredProducts = normalizedCategory
    ? data.filter(
        (product) =>
          product.category?.toUpperCase() === normalizedCategory
      )
    : data;

  if (!filteredProducts.length) {
    return null;
  }

  return (
    <SidebarCarousel
      products={filteredProducts}
      orientation={orientation}
      className={className}
      autoplayDelayOffset={autoplayDelayOffset}
      variant={variant}
    />
  );
}
