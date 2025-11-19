import Link from "next/link";

import { getFooterContent } from "@/data/footer";
import { i18n, Locale } from "../../../i18n-config";

type FooterProps = {
  locale: Locale;
};

const Footer = ({ locale }: FooterProps) => {
  const content = getFooterContent(locale);
  const { defaultLocale } = i18n;
  const localePrefix = locale === defaultLocale ? "" : `/${locale}`;
  const homeHref = locale === defaultLocale ? "/" : `/${locale}`;
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white mt-8">
      <div className="w-full max-w-screen-xl mx-auto p-4 md:py-8">
        <div className="sm:flex sm:items-center sm:justify-between">
          <Link href={homeHref} className="flex items-center mb-4 sm:mb-0 space-x-3 rtl:space-x-reverse">
            <span className="self-center text-2xl font-semibold whitespace-nowrap">{content.brandName}</span>
          </Link>
          <ul className="flex flex-wrap items-center mb-6 text-sm font-medium text-gray-400 sm:mb-0">
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
        </div>
        <hr className="my-6 border-gray-700 sm:mx-auto lg:my-8" />
        <span className="block text-sm text-gray-400 sm:text-center">
          © {currentYear}{" "}
          <Link href={homeHref} className="hover:underline">
            {content.brandName}
          </Link>
          . {content.rightsText}
        </span>
      </div>
    </footer>
  );
};

export default Footer;
