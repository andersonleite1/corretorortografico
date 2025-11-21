import {fetchMercadoLivreProducts} from "@/services/productMetadata";
import {SidebarCarousel} from "./SidebarCarousel";

interface SidebarCarouselServerProps {
  orientation?: "vertical" | "horizontal";
  className?: string;
}

export async function SidebarCarouselServer({
  orientation,
  className,
}: SidebarCarouselServerProps) {
  const products = await fetchMercadoLivreProducts();

  if (!products.length) {
    return null;
  }

  return (
    <SidebarCarousel
      products={products}
      orientation={orientation}
      className={className}
    />
  );
}
