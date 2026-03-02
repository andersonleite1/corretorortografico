"use client";

import React, { useState } from "react";
import Dialog from "../TiptapEditor/components/ui/Dialog";
import { motion } from "framer-motion";

interface ProWaitlistDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProWaitlistDialog({
  isOpen,
  onClose,
}: ProWaitlistDialogProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const device = navigator.userAgent;
      const info = {
        screenResolution: `${window.screen.width}x${window.screen.height}`,
        language: navigator.language,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      };

      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ device, info }),
      });

      if (res.ok) {
        setSuccess(true);
      }
    } catch (error) {
      console.error("Failed to join waitlist", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => !open && onClose()}
      className="max-w-md sm:max-w-lg"
    >
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4 text-neutral-900 dark:text-white">
          Novidades a caminho!
        </h2>
        {success ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-6"
          >
            <div className="text-4xl mb-4">🎉</div>
            <p className="font-semibold text-neutral-800 dark:text-neutral-200">
              Você está na lista de espera!
            </p>
            <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
              Em breve enviaremos todas as novidades e descontos exclusivos
              diretamente para o seu e-mail.
            </p>
            <button
              onClick={onClose}
              className="mt-6 px-6 py-2 bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 rounded-full font-medium"
            >
              Fechar
            </button>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <p className="text-neutral-600 dark:text-neutral-400 mb-6 leading-relaxed">
              Estamos finalizando os últimos ajustes para liberar a versão Pro e
              incluir novos recursos incríveis.
              <br />
              <br />
              Gostaria de entrar na nossa lista de espera e receber descontos
              exclusivos, além de informações em primeira mão sobre a liberação
              do Pro?
            </p>
            <div className="flex items-center justify-end gap-3 mt-4">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-full font-medium text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white transition-colors"
                disabled={loading}
              >
                Agora não
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-6 py-2 bg-[#059669] hover:bg-[#047857] text-white rounded-full font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : null}
                Entrar na Lista
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </Dialog>
  );
}
