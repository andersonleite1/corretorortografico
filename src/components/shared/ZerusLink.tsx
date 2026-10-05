"use client";

import { useEffect, useRef, type AnchorHTMLAttributes } from "react";
import { type Locale } from "../../../i18n-config";
import {
  getZerusHref,
  trackZerusEvent,
  type ZerusPlacement,
} from "@/lib/zerus";

type Props = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  locale: Locale;
  placement: ZerusPlacement;
};
export default function ZerusLink({
  locale,
  placement,
  onClick,
  children,
  ...props
}: Props) {
  const ref = useRef<HTMLAnchorElement>(null);
  useEffect(() => {
    if (!ref.current || typeof IntersectionObserver === "undefined") return;
    let visible = false;
    let recorded = false;
    const recordView = () => {
      if (!visible || recorded) return;
      recorded = trackZerusEvent("zerus_cta_view", locale, placement);
      if (recorded) observer.disconnect();
    };
    const observer = new IntersectionObserver(
      (entries) => {
        visible = entries.some((entry) => entry.isIntersecting);
        recordView();
      },
      { threshold: 0.5 },
    );
    observer.observe(ref.current);
    // The analytics script may finish loading after the first intersection.
    const retry = window.setInterval(() => {
      recordView();
      if (recorded) window.clearInterval(retry);
    }, 1000);
    return () => {
      observer.disconnect();
      window.clearInterval(retry);
    };
  }, [locale, placement]);
  return (
    <a
      {...props}
      ref={ref}
      href={getZerusHref(locale, placement)}
      referrerPolicy="origin"
      onClick={(event) => {
        if (
          !window.dispatchEvent(
            new Event("editordetexto:before-leave", { cancelable: true }),
          )
        ) {
          event.preventDefault();
          return;
        }
        onClick?.(event);
        if (!event.defaultPrevented)
          trackZerusEvent("zerus_cta_click", locale, placement);
      }}
    >
      {children}
    </a>
  );
}
