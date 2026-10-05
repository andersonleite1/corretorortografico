"use client";

import React, { useEffect, useRef, useState, useId } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

interface DialogProps {
  children: React.ReactNode;
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
  title?: string;
}
const Dialog = ({
  children,
  open,
  onOpenChange,
  className,
  title,
}: DialogProps) => {
  const [mounted, setMounted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const onChange = useRef(onOpenChange);
  onChange.current = onOpenChange;
  const headingId = useId();
  const reducedMotion = useReducedMotion();
  useEffect(() => {
    setMounted(true);
  }, []);
  useEffect(() => {
    if (!mounted || !open) return;
    const previous = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const heading = ref.current?.querySelector<HTMLElement>("h2,h3");
    if (heading && !title) heading.id = headingId;
    ref.current?.focus();
    const keydown = (event: KeyboardEvent) => {
      if (event.defaultPrevented) return;
      if (event.key === "Escape") {
        event.preventDefault();
        onChange.current?.(false);
      }
      if (event.key !== "Tab") return;
      // Nested Radix portals own their keyboard interactions.
      if (
        (event.target as HTMLElement)?.closest?.(
          "[data-radix-popper-content-wrapper]",
        )
      )
        return;
      const targets = Array.from(
        ref.current?.querySelectorAll<HTMLElement>(
          'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex="0"]',
        ) || [],
      ).filter((el) => el.getClientRects().length > 0);
      if (!targets.length) {
        event.preventDefault();
        return;
      }
      const first = targets[0],
        last = targets[targets.length - 1];
      if (
        event.shiftKey &&
        (document.activeElement === first ||
          document.activeElement === ref.current ||
          !ref.current?.contains(document.activeElement))
      ) {
        event.preventDefault();
        last.focus();
      } else if (
        !event.shiftKey &&
        (document.activeElement === last ||
          document.activeElement === ref.current ||
          !ref.current?.contains(document.activeElement))
      ) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", keydown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", keydown);
      previous?.focus();
    };
  }, [open, mounted, headingId, title]);
  if (!mounted) return null;
  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reducedMotion ? 0 : 0.15 }}
          className="fixed inset-0 z-[100] flex flex-col items-center bg-black/30 dark:bg-black/60 backdrop-blur-sm px-3 py-4 overflow-y-auto"
          onClick={() => onChange.current?.(false)}
        >
          <motion.div
            ref={ref}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            aria-labelledby={title ? undefined : headingId}
            tabIndex={-1}
            initial={{ scale: reducedMotion ? 1 : 0.98, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.15 }}
            className={`relative bg-white dark:bg-[#1c1c1e] rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-700 my-auto w-full overflow-hidden outline-none ${className || "max-w-fit"}`}
            onClick={(event) => event.stopPropagation()}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
};
export default Dialog;
