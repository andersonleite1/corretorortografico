"use client";

import { useMemo } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { FaStripe, FaCcVisa, FaCcMastercard, FaInstagram, FaYoutube, FaLinkedin } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

import { getFooterContent } from "@/data/footer";
import { i18n, type Locale } from "../../../i18n-config";

type FooterProps = {
  initialLocale?: Locale;
};

const Footer = ({ initialLocale }: FooterProps) => {
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
  const localePrefix = currentLocale === defaultLocale ? "" : `/${currentLocale}`;
  const homeHref = currentLocale === defaultLocale ? "/" : `/${currentLocale}`;
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white mt-8">
      <div className="w-full max-w-screen-xl mx-auto p-4 md:py-8">
        <div className="sm:flex sm:items-center sm:justify-between">
          <div className="flex flex-col gap-3 mb-6 sm:mb-0">
            <Link href={homeHref} className="flex items-center space-x-3 rtl:space-x-reverse">
              <span className="self-center text-2xl font-semibold whitespace-nowrap">{content.brandName}</span>
            </Link>
            <div className="flex items-center gap-4 text-gray-400">
              <a href="#" target="_blank" rel="noopener noreferrer" className="hover:text-[#E4405F] transition-colors" title="Instagram">
                <FaInstagram size={20} />
              </a>
              <a href="#" target="_blank" rel="noopener noreferrer" className="hover:text-[#FF0000] transition-colors" title="YouTube">
                <FaYoutube size={20} />
              </a>
              <a href="#" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors" title="X (Twitter)">
                <FaXTwitter size={20} />
              </a>
              <a href="#" target="_blank" rel="noopener noreferrer" className="hover:text-[#0077B5] transition-colors" title="LinkedIn">
                <FaLinkedin size={20} />
              </a>
            </div>
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
              {currentLocale === 'pt' ? 'Suas informações estão seguras e criptografadas.' : 'Your information is secure and encrypted.'}
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
            </span>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Payment Methods */}
            <div className="flex items-center gap-3 text-gray-500 opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all">
              <FaStripe size={32} title="Stripe" />
              <FaCcVisa size={28} title="Visa" />
              <FaCcMastercard size={28} title="Mastercard" />
              <svg
                viewBox="0 0 512 512"
                className="w-8 h-8 fill-current"
                xmlns="http://www.w3.org/2000/svg"
              >
                <title>Pix</title>
                <path d="M141.5 130.41l39.54-39.54a79.22 79.22 0 0 1 112 0l39.46 39.46 29.58-29.58-39.52-39.52a121.05 121.05 0 0 0-171.2 0L121.84 90.75l19.66 39.66zM370.43 141.5l39.54 39.54a79.22 79.22 0 0 1 0 112l-39.46 39.46 29.58 29.58 39.52-39.52a121.05 121.05 0 0 0 0-171.2l-39.52-39.52-29.66 29.66zM141.5 370.43l-39.54-39.54a79.22 79.22 0 0 1 0-112l39.52-39.52-29.64-29.64-39.46 39.46a121.05 121.05 0 0 0 0 171.2l39.52 39.52 29.6-29.48zM370.43 370.43l-39.54 39.54a79.22 79.22 0 0 1-112 0l-39.46-39.46-29.58 29.58 39.52 39.52a121.05 121.05 0 0 0 171.2 0l39.52-39.52-29.46-29.66zM256 186.27l-69.73 69.73L256 325.73l69.73-69.73L256 186.27z" />
              </svg>
            </div>

            {/* Security Badge */}
            <div className="opacity-40 hover:opacity-100 transition-all duration-300 grayscale hover:grayscale-0 border-l border-gray-800 pl-6 h-10 flex items-center">
              <Image
                src="/comprasegurassl.webp"
                alt="Compra Segura SSL"
                width={60}
                height={20}
                className="h-auto w-[50px] md:w-[60px]"
              />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
