"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { i18n, type Locale } from "../../../i18n-config";
import ThemeSwitcher from "./ThemeSwitcher";
import dynamic from "next/dynamic";
import { Menu } from "lucide-react";
import { getHeaderContent } from "@/data/header";
import { getCommonMessages } from "@/data/common";
import { getAcquisitionContent } from "@/data/acquisition";
import { InstallPWA } from "./InstallPWA";
import ZerusLink from "./ZerusLink";

const MobileMenu = dynamic(() => import("./MobileMenu"), { ssr: false });
const linkClass =
  "rounded-full bg-neutral-900 px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 dark:bg-white dark:text-neutral-900 whitespace-nowrap";

export default function Header() {
  const pathname = usePathname() || "/";
  const router = useRouter();
  const { locales, defaultLocale } = i18n;
  const { currentLocale, segments } = useMemo(() => {
    const segments = pathname.split("/").filter(Boolean);
    const potential = segments[0] as Locale;
    return {
      currentLocale: locales.includes(potential) ? potential : defaultLocale,
      segments,
    };
  }, [pathname, locales, defaultLocale]);
  const t = getAcquisitionContent(currentLocale);
  const header = getHeaderContent(currentLocale);
  const [theme, setTheme] = useState("light");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  useEffect(() => {
    const updateTheme = () =>
      setTheme(
        document.documentElement.classList.contains("dark") ? "dark" : "light",
      );
    updateTheme();
    const observer = new MutationObserver(updateTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);
  const switchLocale = (nextLocale: Locale) => {
    document.cookie = `NEXT_LOCALE=${nextLocale}; path=/; max-age=31536000; SameSite=Lax`;
    if (nextLocale === currentLocale) return;
    const rest = locales.includes(segments[0] as Locale)
      ? segments.slice(1)
      : segments;
    const nextPath =
      nextLocale === defaultLocale
        ? `/${rest.join("/")}`
        : `/${[nextLocale, ...rest].join("/")}`;
    // Keep a local document open when switching language.
    router.push(`${nextPath}${window.location.search}${window.location.hash}`);
  };
  return (
    <>
      <header className="sticky z-50 top-0 px-3 sm:px-6 border-b border-neutral-300 dark:border-neutral-700 bg-white/80 dark:bg-[#0d1018]/80 backdrop-blur-lg">
        <div className="h-16 max-w-screen-xl w-full mx-auto flex items-center justify-between gap-3">
          <Link
            href={currentLocale === defaultLocale ? "/" : `/${currentLocale}`}
          >
            <Image
              src={theme === "dark" ? "/logo-black.webp" : "/logo.webp"}
              alt={header.logoAlt}
              width={150}
              height={90}
              className="w-24 sm:w-[150px] h-auto"
              priority
            />
          </Link>
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="hidden md:flex items-center gap-4">
              <InstallPWA />
              <div
                className="flex h-9 items-center rounded-full border border-neutral-300 bg-white/70 p-1 text-[11px] uppercase dark:border-neutral-700 dark:bg-neutral-900/60"
                aria-label={header.selectLanguage}
              >
                {locales.map((locale) => (
                  <button
                    key={locale}
                    type="button"
                    aria-pressed={locale === currentLocale}
                    onClick={() => switchLocale(locale)}
                    className={`px-3 py-1 rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-600 ${locale === currentLocale ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900" : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"}`}
                  >
                    {locale.toUpperCase()}
                  </button>
                ))}
              </div>
              <ZerusLink
                locale={currentLocale}
                placement="header"
                className={`${linkClass} inline-flex h-9 items-center justify-center`}
                aria-label={t.cta}
              >
                {t.cta}
              </ZerusLink>
              <ThemeSwitcher />
            </div>
            <ZerusLink
              locale={currentLocale}
              placement="mobile_header"
              className={`${linkClass} md:hidden text-xs px-3`}
              aria-label={t.cta}
            >
              {t.cta}
            </ZerusLink>
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800"
              aria-label={getCommonMessages(currentLocale).header.openMenu}
              aria-expanded={isMobileMenuOpen}
            >
              <Menu className="w-6 h-6 text-neutral-600 dark:text-neutral-400" />
            </button>
          </div>
        </div>
      </header>
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        currentLocale={currentLocale}
        switchLocale={switchLocale}
      />
    </>
  );
}
