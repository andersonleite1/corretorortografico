"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cookie, X } from "lucide-react";
import Link from "next/link";
import { Locale } from "../../../i18n-config";
import { getCookieConsentContent } from "@/data/cookie-consent";

interface CookieConsentProps {
  locale: Locale;
}

export const CookieConsent: React.FC<CookieConsentProps> = ({ locale }) => {
  const [isVisible, setIsVisible] = useState(false);
  const content = getCookieConsentContent(locale);

  useEffect(() => {
    const consent = localStorage.getItem("cookie_consent");
    if (!consent) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookie_consent", "true");
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed bottom-6 left-6 right-6 z-[9999] mx-auto max-w-4xl"
        >
          <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-white/20 bg-white/70 p-4 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-black/70 md:flex-row md:p-6">
            <div className="flex items-start gap-4">
              <div className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 sm:flex">
                <Cookie className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                  {content.message}
                  <Link
                    href={`/${locale}/privacy`}
                    className="ml-1 font-medium text-blue-600 transition-colors hover:text-blue-700 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    {content.privacyPolicy}
                  </Link>
                </p>
              </div>
            </div>
            <div className="flex w-full shrink-0 gap-2 md:w-auto">
              <button
                onClick={handleAccept}
                className="flex flex-1 items-center justify-center rounded-xl bg-blue-600 px-8 py-2.5 text-sm font-semibold text-white transition-all hover:bg-blue-700 hover:shadow-lg active:scale-95 dark:bg-blue-500 dark:hover:bg-blue-600 md:flex-none"
              >
                {content.button}
              </button>
              <button
                onClick={() => setIsVisible(false)}
                className="flex items-center justify-center rounded-xl border border-gray-200 bg-white p-2 text-gray-500 transition-all hover:bg-gray-50 hover:text-gray-700 dark:border-white/10 dark:bg-white/5 dark:text-gray-400 dark:hover:bg-white/10 dark:hover:text-gray-200"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
