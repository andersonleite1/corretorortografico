"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Locale, i18n } from "../../../i18n-config";
import Link from "next/link";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import ThemeSwitcher from "./ThemeSwitcher";
import { X } from "lucide-react";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  currentLocale: Locale;
  switchLocale: (nextLocale: Locale) => void;
  setAuthModal: (modal: {
    isOpen: boolean;
    view: "sign-in" | "sign-up";
  }) => void;
  userButton?: React.ReactNode;
}

const MobileMenu = ({
  isOpen,
  onClose,
  currentLocale,
  switchLocale,
  setAuthModal,
  userButton,
}: MobileMenuProps) => {
  const { locales } = i18n;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="fixed inset-0 z-[60] flex flex-col bg-white/80 dark:bg-neutral-950/80 backdrop-blur-xl lg:hidden"
        >
          <div className="flex items-center justify-between h-16 px-6 border-b border-neutral-200 dark:border-neutral-800">
            <span className="text-lg font-semibold text-neutral-900 dark:text-white">
              Menu
            </span>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              <X className="w-6 h-6 text-neutral-600 dark:text-neutral-400" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto py-8 px-6 flex flex-col gap-8">
            <div className="flex flex-col gap-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                Idioma
              </span>
              <div className="grid grid-cols-2 gap-2">
                {locales.map((locale) => {
                  const isActive = locale === currentLocale;
                  return (
                    <button
                      key={locale}
                      onClick={() => {
                        switchLocale(locale as Locale);
                        onClose();
                      }}
                      className={`flex items-center justify-center px-4 py-3 rounded-2xl transition-all ${
                        isActive
                          ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-lg"
                          : "bg-neutral-100 text-neutral-600 dark:bg-neutral-900 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-800"
                      }`}
                    >
                      {locale.toUpperCase()}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                Conta
              </span>
              <div className="flex flex-col gap-3">
                <SignedOut>
                  <button
                    onClick={() => {
                      setAuthModal({ isOpen: true, view: "sign-in" });
                      onClose();
                    }}
                    className="flex items-center justify-center px-4 py-4 rounded-2xl bg-neutral-100 dark:bg-neutral-900 text-neutral-900 dark:text-white font-medium hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-all border border-neutral-200 dark:border-neutral-800"
                  >
                    Entrar
                  </button>
                  <button
                    onClick={() => {
                      setAuthModal({ isOpen: true, view: "sign-up" });
                      onClose();
                    }}
                    className="flex items-center justify-center px-4 py-4 rounded-2xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-semibold shadow-xl hover:opacity-90 transition-all"
                  >
                    Começar agora
                  </button>
                </SignedOut>
                <SignedIn>
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                    <span className="text-neutral-900 dark:text-white font-medium">
                      Sua conta
                    </span>
                    {userButton}
                  </div>
                </SignedIn>
              </div>
            </div>

            <div className="mt-auto flex items-center justify-between p-4 rounded-2xl bg-neutral-100/50 dark:bg-neutral-900/50 border border-neutral-200/50 dark:border-neutral-800/50">
              <span className="text-sm text-neutral-600 dark:text-neutral-400">
                Tema
              </span>
              <ThemeSwitcher />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MobileMenu;
