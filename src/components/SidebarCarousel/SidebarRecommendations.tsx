"use client";

import clsx from "clsx";

import { useMercadoLivreProductGroups } from "@/hooks/useMercadoLivreProducts";

import { SidebarCarousel } from "./SidebarCarousel";

type SidebarRecommendationsProps = {
  className?: string;
};

export function SidebarRecommendations({
  className,
}: SidebarRecommendationsProps) {
  const { loading, error, smartphoneProducts, othersProducts } =
    useMercadoLivreProductGroups();
  const showEmptyState =
    !loading && !smartphoneProducts.length && !othersProducts.length;

  return (
    <div className={clsx("flex flex-col gap-4", className)}>
      {smartphoneProducts.length ? (
        <SidebarCarousel
          className="w-full"
          autoplayDelayOffset={1000}
          products={smartphoneProducts}
        />
      ) : null}
      {othersProducts.length ? (
        <SidebarCarousel
          className="w-full"
          autoplayDelayOffset={2300}
          products={othersProducts}
        />
      ) : null}
      {loading ? <SidebarSkeleton /> : null}
      {showEmptyState ? (
        <div className="rounded-[2rem] border border-dashed border-slate-200 bg-white/80 px-5 py-6 text-center text-sm text-slate-500 shadow-sm">
          {error ?? "Ainda não temos ofertas disponíveis. Volte em instantes."}
        </div>
      ) : null}
    </div>
  );
}

function SidebarSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      {[0, 1].map((key) => (
        <div
          key={key}
          className="animate-pulse rounded-[2rem] border border-slate-200 bg-white/80 px-5 py-6 shadow-sm"
        >
          <div className="flex items-center gap-4">
            <div className="h-24 w-24 rounded-[1.5rem] bg-slate-100" />
            <div className="flex flex-1 flex-col gap-2">
              <div className="h-4 w-3/4 rounded-full bg-slate-100" />
              <div className="h-4 w-2/3 rounded-full bg-slate-100" />
            </div>
          </div>
          <div className="mt-4 h-10 w-full rounded-full bg-slate-100" />
        </div>
      ))}
    </div>
  );
}

