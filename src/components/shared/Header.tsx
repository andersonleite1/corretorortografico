"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { i18n, Locale } from "../../../i18n-config";
import ThemeSwitcher from "./ThemeSwitcher";
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
} from "@clerk/nextjs";
interface HeaderProps {
  userButton?: React.ReactNode;
}

const Header = ({ userButton }: HeaderProps) => {
  const pathname = usePathname() || "/";
  const router = useRouter();
  const { locales, defaultLocale } = i18n;
  const segments = useMemo(() => pathname.split("/").filter(Boolean), [pathname]);
  const currentLocale = useMemo<Locale>(() => {
    const potential = segments[0] as Locale | undefined;
    return locales.includes(potential as Locale) ? potential! : defaultLocale;
  }, [segments, locales, defaultLocale]);

  const [theme, setTheme] = useState("light");

  useEffect(() => {
    const currentTheme = document.documentElement.classList.contains("dark") ? "dark" : "light";
    setTheme(currentTheme);
  }, []);

  const switchLocale = (nextLocale: Locale) => {
    if (nextLocale === currentLocale) return;

    const pathSegments = [...segments];
    const hasLocalePrefix = locales.includes(pathSegments[0] as Locale);
    const restSegments = hasLocalePrefix ? pathSegments.slice(1) : pathSegments;
    const restPath = restSegments.join("/");

    const nextPath =
      nextLocale === defaultLocale
        ? restPath ? `/${restPath}` : "/"
        : `/${[nextLocale, ...restSegments].join("/")}`;

    router.push(nextPath || "/");
  };

  return (
    <header className="sticky z-50 top-0 px-6 border-b border-neutral-300 dark:border-neutral-700 bg-white/20 dark:bg-[#0d101820] backdrop-blur-lg">
      <div className="h-16 max-w-screen-xl w-full mx-auto flex items-center justify-between gap-6">
        <Link href="/">
          <Image
            src={theme === "dark" ? "/logo-black.webp" : "/logo.webp"}
            alt="Editor de texto"
            width={150}
            height={90}
            priority
          />
        </Link>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-neutral-500 dark:text-neutral-400">
            <span>Idioma</span>
            <div className="flex rounded-full border border-neutral-300 bg-white/70 p-1 text-[11px] uppercase dark:border-neutral-700 dark:bg-neutral-900/60">
              {locales.map((locale) => {
                const isActive = locale === currentLocale;
                return (
                  <button
                    key={locale}
                    type="button"
                    onClick={() => switchLocale(locale as Locale)}
                    className={`px-3 py-1 rounded-full transition ${isActive
                      ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                      : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                      }`}
                  >
                    {locale.toUpperCase()}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="flex gap-4 items-center">
            <SignedOut>
              <SignInButton mode="modal">
                <button className="text-sm font-medium text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white transition-colors">
                  Entrar
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 px-4 py-2 rounded-full text-sm font-semibold hover:opacity-90 transition-opacity">
                  Começar agora
                </button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              {userButton}
            </SignedIn>
            <ThemeSwitcher />
          </div>
        </div>
      </div>

    </header>
  );
};

export default Header;
