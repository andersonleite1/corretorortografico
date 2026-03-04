"use client";

import React from "react";
import EmailSignIn from "./EmailSignIn";
import EmailCodeSignUp from "./EmailCodeSignUp";
import Dialog from "../TiptapEditor/components/ui/Dialog";
import { motion, AnimatePresence } from "framer-motion";

interface AuthOverlayProps {
  isOpen: boolean;
  view: "sign-in" | "sign-up";
  onClose: () => void;
  onSwitchView: (view: "sign-in" | "sign-up") => void;
}

export default function AuthOverlay({
  isOpen,
  view,
  onClose,
  onSwitchView,
}: AuthOverlayProps) {
  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => !open && onClose()}
      className="max-w-md sm:max-w-[540px]"
    >
      <AnimatePresence mode="wait">
        {view === "sign-up" ? (
          <motion.div
            key="sign-up"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
          >
            <EmailCodeSignUp
              onClose={onClose}
              onSignInClick={() => onSwitchView("sign-in")}
            />
          </motion.div>
        ) : (
          <motion.div
            key="sign-in"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
          >
            <EmailSignIn
              onClose={onClose}
              onSignUpClick={() => onSwitchView("sign-up")}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </Dialog>
  );
}
