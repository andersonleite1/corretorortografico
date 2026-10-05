"use client";

import { useMemo } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { getAcquisitionContent } from "@/data/acquisition";

import { getFooterContent } from "@/data/footer";
import { getCommonMessages } from "@/data/common";
import { i18n, type Locale } from "../../../i18n-config";

import packageInfo from "../../../package.json";

type FooterProps = {
  initialLocale?: Locale;
};

const Footer = ({ initialLocale }: FooterProps) => {
  const version = packageInfo.version;
  const pathname = usePathname();
  const { locales, defaultLocale } = i18n;

  const fallbackLocale = useMemo<Locale>(() => {
    if (initialLocale && locales.includes(initialLocale)) {
      return initialLocale;
    }

    return defaultLocale;
  }, [initialLocale, locales, defaultLocale]);

  const currentLocale = useMemo<Locale>(() => {
    if (!pathname) {
      return fallbackLocale;
    }

    const segments = pathname.split("/").filter(Boolean);
    const potential = segments[0] as Locale | undefined;

    if (potential && locales.includes(potential)) {
      return potential;
    }

    return fallbackLocale;
  }, [pathname, locales, fallbackLocale]);

  const content = getFooterContent(currentLocale);
  const t = getCommonMessages(currentLocale).footer;
  const localePrefix =
    currentLocale === defaultLocale ? "" : `/${currentLocale}`;
  const homeHref = currentLocale === defaultLocale ? "/" : `/${currentLocale}`;
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white mt-8">
      <div className="w-full max-w-screen-xl mx-auto p-4 md:py-8">
        <div className="sm:flex sm:items-center sm:justify-between">
          <div className="flex flex-col gap-3 mb-6 sm:mb-0">
            <Link
              href={homeHref}
              className="flex items-center space-x-3 rtl:space-x-reverse"
            >
              <span className="self-center text-2xl font-semibold whitespace-nowrap">
                {content.brandName}
              </span>
            </Link>
          </div>
          <div className="flex flex-col gap-2 mb-4 sm:mb-0">
            <ul className="flex flex-wrap items-center text-sm font-medium text-gray-400">
              {content.links.map((link) => {
                const href = `${localePrefix}${link.path}`;
                return (
                  <li key={link.path}>
                    <Link href={href} className="hover:underline me-4 md:me-6">
                      {link.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
            <p className="text-xs text-gray-500 italic">
              {getAcquisitionContent(currentLocale).storage}
            </p>
          </div>
        </div>
        <hr className="my-6 border-gray-700 sm:mx-auto lg:my-8" />
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col gap-2">
            <span className="block text-sm text-gray-400">
              © {currentYear}{" "}
              <Link href={homeHref} className="hover:underline">
                {content.brandName}
              </Link>
              . {content.rightsText}
              <span className="ml-2 text-[10px] text-gray-600 font-mono opacity-50">
                v{version}
              </span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
