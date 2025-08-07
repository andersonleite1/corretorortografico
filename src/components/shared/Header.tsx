"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import ThemeSwitcher from "./ThemeSwitcher";

const Header = () => {
  const pathname = usePathname();
  const isEditPage = pathname === "/";

  const [theme, setTheme] = useState("light");

  useEffect(() => {
    const currentTheme = document.documentElement.classList.contains("dark") ? "dark" : "light";
    setTheme(currentTheme);
  }, []);

  return (
    <header className="sticky z-50 top-0 px-6 border-b border-neutral-300 dark:border-neutral-700 bg-white/20 dark:bg-[#0d101820] backdrop-blur-lg">
      <div className="h-16 max-w-screen-xl w-full mx-auto flex items-center justify-between gap-6">
        <Link href="/">
          <Image
            src={theme === "dark" ? "/logo-black.png" : "/logo.png"}
            alt="Editor de texto"
            width={150}
            height={90}
          />
        </Link>
        <div className="flex gap-5">
          <ThemeSwitcher />
        </div>
      </div>

    </header>
  );
};

export default Header;
