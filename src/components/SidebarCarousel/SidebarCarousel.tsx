"use client";

import {ProductData} from "@/services/productMetadata";
import clsx from "clsx";
import Image from "next/image";
import {Swiper, SwiperSlide} from "swiper/react";
import {Autoplay, Pagination} from "swiper/modules";

import "swiper/css";
import "swiper/css/autoplay";
import "swiper/css/pagination";

interface SidebarCarouselProps {
  products: ProductData[];
  className?: string;
  orientation?: "vertical" | "horizontal";
  autoplayDelayOffset?: number;
}

export function SidebarCarousel({
  products,
  className,
  orientation = "horizontal",
  autoplayDelayOffset = 0,
}: SidebarCarouselProps) {
  if (!products.length) {
    return null;
  }

  const baseAutoplayDelay = products.length === 1 ? 999999 : 6000;
  const autoplayDelay = baseAutoplayDelay + autoplayDelayOffset;
  const currency = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  return (
    <div className={clsx("w-full", className)}>
      <Swiper
        modules={[Autoplay, Pagination]}
        autoplay={{delay: autoplayDelay, disableOnInteraction: false}}
        loop={products.length > 1}
        direction={orientation}
        slidesPerView={1}
        spaceBetween={12}
        pagination={{clickable: true, dynamicBullets: true}}
        className="h-full pb-8"
      >
        {products.map((product) => (
          <SwiperSlide key={product.affiliateUrl} className="h-auto">
            <article className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-3">
                {product.image ? (
                  <Image
                    src={product.image}
                    alt={product.title}
                    width={96}
                    height={96}
                    className="h-24 w-24 rounded-[1.5rem] border border-slate-100 bg-white object-contain p-1"
                    unoptimized
                  />
                ) : (
                  <div className="flex h-24 w-24 items-center justify-center rounded-[1.5rem] border border-dashed border-slate-200 bg-slate-50 text-sm text-slate-500">
                    Sem imagem
                  </div>
                )}
                <div className="flex flex-1 flex-col">
                  <h3 className="text-sm font-semibold text-slate-900">
                    {truncate(product.title, 80)}
                  </h3>
                  {renderPriceInfo(product, currency)}
                </div>
              </div>
              <a
                href={product.affiliateUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center justify-center rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Ver Oferta
              </a>
            </article>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}

function truncate(text: string, max: number) {
  if (text.length <= max) {
    return text;
  }

  return `${text.slice(0, max - 1)}…`;
}

function renderPriceInfo(product: ProductData, formatter: Intl.NumberFormat) {
  if (typeof product.price !== "number") {
    return null;
  }

  const installments = product.installments;
  const installmentValue =
    typeof product.installmentValue === "number"
      ? product.installmentValue
      : installments
        ? product.price / installments
        : undefined;
  const installmentLabel =
    product.installmentLabel ??
    (installments ? `${installments}X` : undefined);

  return (
    <div className="mt-1">
      {installmentLabel && installmentValue ? (
        <p className="text-xs font-semibold uppercase text-emerald-500">
          {installmentLabel}{" "}
          <span className="text-sm font-bold text-emerald-600">
            {formatter.format(installmentValue)}
          </span>
        </p>
      ) : null}
      {typeof product.originalPrice === "number" &&
      product.originalPrice > product.price ? (
        <p className="text-xs text-slate-400 line-through">
          {formatter.format(product.originalPrice)}
        </p>
      ) : null}
      <p className="text-sm font-semibold text-slate-600">
        À vista{" "}
        <span className="text-base text-slate-900">
          {formatter.format(product.price)}
        </span>
      </p>
    </div>
  );
}
