"use client";

import React, { useEffect, useState } from "react";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { ptBR, enUS, esES } from "@clerk/localizations";

const localizations = {
  pt: ptBR,
  en: enUS,
  es: esES,
};

export function ClerkThemeProvider({
  children,
  locale = "pt",
}: {
  children: React.ReactNode;
  locale?: string;
}) {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Check if dark mode is enabled on HTML element or via localStorage
    const checkTheme = () => {
      const hasDarkClass = document.documentElement.classList.contains("dark");
      const savedTheme = localStorage.getItem("theme");

      if (
        savedTheme === "dark" ||
        (!savedTheme &&
          window.matchMedia("(prefers-color-scheme: dark)").matches)
      ) {
        setIsDarkMode(true);
      } else {
        setIsDarkMode(hasDarkClass);
      }
    };

    checkTheme();

    // Optional: add listener for storage changes if theme can change without reload
    window.addEventListener("storage", checkTheme);

    return () => window.removeEventListener("storage", checkTheme);
  }, []);

  return (
    <ClerkProvider
      localization={localizations[locale as keyof typeof localizations] || ptBR}
      appearance={{
        baseTheme: isDarkMode ? dark : undefined,
        variables: {
          colorPrimary: "#6366f1",
        },
      }}
    >
      {children}
    </ClerkProvider>
  );
}
