"use client";

import Link from "next/link";
import clsx from "clsx";

import { i18n, type Locale } from "../../../i18n-config";

const LABELS: Record<Locale, string> = {
  pt: "Voltar ao início",
  en: "Back to home",
  es: "Volver al inicio",
};

type BackHomeButtonProps = {
  locale: Locale;
  className?: string;
};

export function BackHomeButton({ locale, className }: BackHomeButtonProps) {
  const normalized = i18n.locales.includes(locale)
    ? locale
    : i18n.defaultLocale;
  const href = normalized === i18n.defaultLocale ? "/" : `/${normalized}`;
  const label = LABELS[normalized] ?? LABELS[i18n.defaultLocale];

  return (
    <Link
      href={href}
      className={clsx(
        "inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm font-medium text-slate-500 shadow-sm transition hover:text-slate-900 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-200",
        className,
      )}
    >
      <svg
        className="h-4 w-4"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M6.25 3.25L1.5 8l4.75 4.75"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M2 8h12.5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
      {label}
    </Link>
  );
}
