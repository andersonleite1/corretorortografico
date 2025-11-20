import {ProductData, fetchProductMetadata} from "@/services/productMetadata";
import {SidebarCarousel} from "./SidebarCarousel";

interface SidebarCarouselServerProps {
  affiliateLinks: string[];
  orientation?: "vertical" | "horizontal";
  className?: string;
}

export async function SidebarCarouselServer({
  affiliateLinks,
  orientation,
  className,
}: SidebarCarouselServerProps) {
  if (!affiliateLinks.length) {
    return null;
  }

  const products = (
    await Promise.all(affiliateLinks.map((url) => fetchProductMetadata(url)))
  ).filter((product): product is ProductData => Boolean(product));

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
