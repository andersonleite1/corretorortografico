"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronUp } from "lucide-react";

export const ScrollToTop = () => {
    const [isVisible, setIsVisible] = useState(false);

    // Show button when page is scrolled up to a certain distance
    const toggleVisibility = () => {
        if (window.scrollY > 400) {
            setIsVisible(true);
        } else {
            setIsVisible(false);
        }
    };

    // Set the top cordinate to 0
    // make scrolling smooth
    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    useEffect(() => {
        window.addEventListener("scroll", toggleVisibility);
        return () => window.removeEventListener("scroll", toggleVisibility);
    }, []);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.button
                    initial={{ opacity: 0, scale: 0.5, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.5, y: 20 }}
                    whileHover={{
                        scale: 1.1,
                        y: -5,
                        background: "var(--rte-primary)",
                        color: "#fff",
                        boxShadow: "0 20px 25px -5px rgba(5, 150, 105, 0.4), 0 10px 10px -5px rgba(5, 150, 105, 0.1)"
                    }}
                    whileTap={{ scale: 0.95 }}
                    onClick={scrollToTop}
                    className="fixed bottom-8 right-8 z-50 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/80 backdrop-blur-md text-[#059669] shadow-xl border border-gray-200/50 dark:bg-gray-900/80 dark:text-[#10b981] dark:border-gray-700/50 transition-all duration-300 group"
                    aria-label="Voltar para o topo"
                >
                    <ChevronUp className="h-7 w-7 transition-transform duration-300 group-hover:-translate-y-1" />
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-[#059669]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </motion.button>
            )}
        </AnimatePresence>
    );
};
