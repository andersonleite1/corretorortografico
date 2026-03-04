"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { i18n, Locale } from "../../../i18n-config";
import ThemeSwitcher from "./ThemeSwitcher";
import { SignedIn, SignedOut, useAuth } from "@clerk/nextjs";
import dynamic from "next/dynamic";
import { Menu } from "lucide-react";
const MobileMenu = dynamic(() => import("./MobileMenu"), {
  ssr: false,
});
import Tooltip from "../TiptapEditor/components/ui/Tooltip";
import { getHeaderContent } from "@/data/header";
import { getCommonMessages } from "@/data/common";

const AuthOverlay = dynamic(() => import("../auth/AuthOverlay"), {
  ssr: false,
});

interface HeaderProps {
  userButton?: React.ReactNode;
}

const HeaderSkeleton = () => (
  <div className="flex gap-4 items-center">
    <div className="w-16 h-8 bg-neutral-100 dark:bg-neutral-800 animate-pulse rounded-full" />
    <div className="w-24 h-8 bg-neutral-100 dark:bg-neutral-800 animate-pulse rounded-full" />
  </div>
);

const Header = ({ userButton }: HeaderProps) => {
  const pathname = usePathname() || "/";
  const router = useRouter();
  const { locales, defaultLocale } = i18n;
  const { isLoaded, userId } = useAuth();
  const { currentLocale, segments } = useMemo(() => {
    const segments = pathname.split("/").filter(Boolean);
    const potential = segments[0] as Locale | undefined;
    const currentLocale = locales.includes(potential as Locale)
      ? potential!
      : defaultLocale;
    return { currentLocale, segments };
  }, [pathname, locales, defaultLocale]);

  const t = getCommonMessages(currentLocale).header;
  const [clerkTimeout, setClerkTimeout] = useState(false);

  // Timeout para evitar skeleton infinito se Clerk demorar
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isLoaded) {
        console.warn(
          "[Header] Clerk demorou mais de 2s para carregar. Usando fallback.",
        );
        setClerkTimeout(true);
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [isLoaded]);

  const [theme, setTheme] = useState("light");
  const [authModal, setAuthModal] = useState<{
    isOpen: boolean;
    view: "sign-in" | "sign-up";
  }>({
    isOpen: false,
    view: "sign-in",
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const headerContent = useMemo(
    () => getHeaderContent(currentLocale),
    [currentLocale],
  );

  useEffect(() => {
    const currentTheme = document.documentElement.classList.contains("dark")
      ? "dark"
      : "light";
    setTheme(currentTheme);
  }, []);

  const switchLocale = (nextLocale: Locale) => {
    // Persiste o idioma em um cookie para o Middleware respeitar a escolha do usuário
    document.cookie = `NEXT_LOCALE=${nextLocale}; path=/; max-age=31536000; SameSite=Lax`;

    if (nextLocale === currentLocale) return;

    const pathSegments = [...segments];
    const hasLocalePrefix = locales.includes(pathSegments[0] as Locale);
    const restSegments = hasLocalePrefix ? pathSegments.slice(1) : pathSegments;
    const restPath = restSegments.join("/");

    const nextPath =
      nextLocale === defaultLocale
        ? restPath
          ? `/${restPath}`
          : "/"
        : `/${[nextLocale, ...restSegments].join("/")}`;

    router.push(nextPath || "/");
  };

  const closeAuthModal = () => setAuthModal({ ...authModal, isOpen: false });

  return (
    <>
      <header className="sticky z-50 top-0 px-6 border-b border-neutral-300 dark:border-neutral-700 bg-white/20 dark:bg-[#0d101820] backdrop-blur-lg">
        <div className="h-16 max-w-screen-xl w-full mx-auto flex items-center justify-between gap-6">
          <div className="flex items-center gap-8">
            <Link href="/">
              <Image
                src={theme === "dark" ? "/logo-black.webp" : "/logo.webp"}
                alt={t.appName}
                width={150}
                height={90}
                priority
              />
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-4">
              <SignedIn>
                <Link
                  href={`/${currentLocale}/dashboard`}
                  className="flex items-center gap-1.5 text-sm font-medium text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white transition-colors"
                >
                  <span>📊</span>
                  <span>{t.dashboard}</span>
                </Link>
              </SignedIn>
              <div className="flex items-center gap-2 text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                <Tooltip content={headerContent.selectLanguage} portal>
                  <div className="flex rounded-full border border-neutral-300 bg-white/70 p-1 text-[11px] uppercase dark:border-neutral-700 dark:bg-neutral-900/60 transition-colors hover:border-neutral-400 dark:hover:border-neutral-600">
                    {locales.map((locale) => {
                      const isActive = locale === currentLocale;
                      return (
                        <button
                          key={locale}
                          type="button"
                          onClick={() => switchLocale(locale as Locale)}
                          className={`px-3 py-1 rounded-full transition ${
                            isActive
                              ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                              : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                          }`}
                        >
                          {locale.toUpperCase()}
                        </button>
                      );
                    })}
                  </div>
                </Tooltip>
              </div>
              <div className="flex gap-4 items-center min-w-[140px] justify-end">
                {!isLoaded && !clerkTimeout ? (
                  <HeaderSkeleton />
                ) : (
                  <>
                    {/* Bypass Clerk's SignedIn/SignedOut components during timeout */}
                    {!isLoaded || !userId ? (
                      <>
                        <button
                          onClick={() =>
                            setAuthModal({ isOpen: true, view: "sign-in" })
                          }
                          className="text-sm font-medium text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white transition-colors"
                        >
                          Entrar
                        </button>
                        <button
                          onClick={() =>
                            setAuthModal({ isOpen: true, view: "sign-up" })
                          }
                          className="bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 px-4 py-2 rounded-full text-sm font-semibold hover:opacity-90 transition-opacity whitespace-nowrap"
                        >
                          Começar agora
                        </button>
                      </>
                    ) : (
                      <SignedIn>{userButton}</SignedIn>
                    )}
                  </>
                )}
                <ThemeSwitcher />
              </div>
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              aria-label={t.openMenu}
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
        setAuthModal={setAuthModal}
        userButton={userButton}
      />

      <AuthOverlay
        isOpen={authModal.isOpen}
        view={authModal.view}
        onClose={closeAuthModal}
        onSwitchView={(view) => setAuthModal({ isOpen: true, view })}
      />
    </>
  );
};

export default Header;
