"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { type Locale, i18n } from "../../../i18n-config";
import ThemeSwitcher from "./ThemeSwitcher";
import { X } from "lucide-react";
import { getAcquisitionContent } from "@/data/acquisition";
import ZerusLink from "./ZerusLink";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  currentLocale: Locale;
  switchLocale: (locale: Locale) => void;
};
export default function MobileMenu({
  isOpen,
  onClose,
  currentLocale,
  switchLocale,
}: Props) {
  const t = getAcquisitionContent(currentLocale);
  const dialogRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  useEffect(() => {
    if (!isOpen) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    dialogRef.current?.querySelector<HTMLElement>("button")?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key !== "Tab") return;
      const targets = dialogRef.current?.querySelectorAll<HTMLElement>(
        "button:not([disabled]), a[href]",
      );
      if (!targets?.length) return;
      const first = targets[0];
      const last = targets[targets.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKey);
      previousFocus?.focus();
    };
  }, [isOpen, onClose]);
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={dialogRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reducedMotion ? 0 : 0.15 }}
          className="fixed inset-0 z-[60] flex flex-col bg-white dark:bg-neutral-950 md:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
        >
          <div className="flex items-center justify-between h-16 px-6 border-b border-neutral-200 dark:border-neutral-800">
            <span className="text-lg font-semibold">Menu</span>
            <button
              type="button"
              onClick={onClose}
              className="p-3 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800"
              aria-label={t.closeMenu}
            >
              <X size={24} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-8">
            <div className="space-y-3">
              <p className="text-sm text-neutral-500">{t.language}</p>
              <div className="grid grid-cols-3 gap-2">
                {i18n.locales.map((locale) => (
                  <button
                    key={locale}
                    type="button"
                    aria-pressed={locale === currentLocale}
                    onClick={() => {
                      switchLocale(locale);
                      onClose();
                    }}
                    className={`py-3 rounded-xl ${locale === currentLocale ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900" : "bg-neutral-100 dark:bg-neutral-900"}`}
                  >
                    {locale.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              <p className="text-sm text-neutral-500">Zerus</p>
              <p className="text-sm">{t.description}</p>
              <ZerusLink
                locale={currentLocale}
                placement="mobile_menu"
                className="block rounded-xl bg-neutral-900 px-4 py-3 text-center text-white dark:bg-white dark:text-neutral-900"
                onClick={onClose}
              >
                {t.cta}
              </ZerusLink>
              <p className="text-xs text-neutral-500">{t.note}</p>
            </div>
            <div className="mt-auto flex items-center justify-between">
              <span>{t.theme}</span>
              <ThemeSwitcher />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
