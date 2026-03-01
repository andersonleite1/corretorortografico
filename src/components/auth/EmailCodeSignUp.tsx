"use client";

import { useSignUp } from "@clerk/nextjs";
import { useState, useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "../TiptapEditor/components/ui/Icon";
import { i18n, Locale } from "../../../i18n-config";
import { getAuthContent } from "@/data/auth";

interface EmailCodeSignUpProps {
  onClose?: () => void;
  onSignInClick?: () => void;
}

export default function EmailCodeSignUp({
  onClose,
  onSignInClick,
}: EmailCodeSignUpProps) {
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();
  const pathname = usePathname() || "/";
  const { locales, defaultLocale } = i18n;

  const currentLocale = useMemo<Locale>(() => {
    const segments = pathname.split("/").filter(Boolean);
    const potential = segments[0] as Locale | undefined;
    return locales.includes(potential as Locale) ? potential! : defaultLocale;
  }, [pathname, locales, defaultLocale]);

  const authContent = useMemo(
    () => getAuthContent(currentLocale),
    [currentLocale],
  );

  const [emailAddress, setEmailAddress] = useState("");
  const [code, setCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const getFriendlyErrorMessage = (err: any) => {
    const errorItem = err.errors?.[0];
    if (!errorItem) return authContent.errors.unexpected;

    const code = errorItem.code;

    switch (code) {
      case "form_identifier_exists":
        return authContent.errors.identifier_exists;
      case "form_password_pwned":
        return authContent.errors.password_pwned;
      case "form_code_incorrect":
        return authContent.errors.code_incorrect;
      case "form_identifier_invalid":
        return authContent.errors.identifier_invalid;
      default:
        return errorItem.longMessage || authContent.errors.unexpected;
    }
  };

  if (!isLoaded) return null;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await signUp!.create({
        emailAddress,
      });

      await signUp!.prepareEmailAddressVerification({
        strategy: "email_code",
      });

      setVerifying(true);
    } catch (err: any) {
      setError(getFriendlyErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const completeSignUp = await signUp!.attemptEmailAddressVerification({
        code: code.replace(/\s/g, ""),
      });

      if (completeSignUp.status === "complete") {
        await setActive!({ session: completeSignUp.createdSessionId });
        router.push("/");
        if (onClose) onClose();
      } else {
        if (completeSignUp.status === "missing_requirements") {
          const missing = completeSignUp.missingFields;
          setError(
            `O cadastro requer mais informações: ${missing?.join(", ") || "campos pendentes"}.`,
          );
        } else {
          setError(
            `Erro ao completar cadastro (Status: ${completeSignUp.status}).`,
          );
        }
      }
    } catch (err: any) {
      setError(getFriendlyErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="px-8 py-8 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Criar Cadastro
          </h2>
          <p className="text-sm font-medium text-gray-400 dark:text-gray-500 mt-1 uppercase tracking-widest leading-relaxed">
            Join • Save • Cloud
          </p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2.5 rounded-full bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-400 dark:text-gray-500 transition-all active:scale-90"
          >
            <Icon name="Close" size={24} />
          </button>
        )}
      </div>

      {/* Content Area with Transitions */}
      <div className="p-8">
        <AnimatePresence mode="wait">
          {!verifying ? (
            <motion.form
              key="email-step"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              onSubmit={submit}
              className="space-y-8"
            >
              <div className="space-y-4">
                <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest pl-1">
                  Endereço de e-mail
                </label>
                <div className="relative group">
                  <input
                    type="email"
                    placeholder="Ex: seuemail@exemplo.com"
                    value={emailAddress}
                    onChange={(e) => setEmailAddress(e.target.value)}
                    required
                    className="w-full px-5 py-4 bg-gray-50/50 dark:bg-black/20 border border-gray-100 dark:border-white/5 rounded-2xl text-[15px] focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 transition-all dark:text-white outline-none placeholder:text-gray-300 dark:placeholder:text-gray-700 font-medium"
                  />
                </div>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-red-50 dark:bg-red-500/10 p-4 rounded-2xl border border-red-100 dark:border-red-500/10 flex gap-3"
                >
                  <Icon
                    name="Alert"
                    size={18}
                    className="text-red-500 shrink-0"
                  />
                  <p className="text-xs font-bold text-red-600 dark:text-red-400 italic leading-relaxed">
                    {error}
                  </p>
                </motion.div>
              )}

              {/* CAPTCHA Placeholder */}
              <div id="clerk-captcha" className="flex justify-center" />

              <div className="pt-4 flex flex-col gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-blue-500 text-white font-bold rounded-full shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 active:scale-95 hover:bg-blue-600 disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    "Enviar Código"
                  )}
                </button>

                <p className="text-center text-[13px] font-medium text-gray-500 dark:text-gray-400">
                  Já possui uma conta?{" "}
                  <button
                    type="button"
                    onClick={onSignInClick}
                    className="text-blue-500 hover:text-blue-600 font-bold underline decoration-2 underline-offset-4"
                  >
                    Entrar Agora
                  </button>
                </p>
              </div>
            </motion.form>
          ) : (
            <motion.form
              key="verify-step"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              onSubmit={handleVerify}
              className="space-y-8"
            >
              <div className="flex flex-col items-center text-center space-y-4 mb-2">
                <div className="w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center">
                  <Icon name="Keyboard" size={32} className="text-blue-500" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    Verifique seu e-mail
                  </h3>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">
                    Enviamos um código para {emailAddress}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest pl-1">
                  Código de Verificação
                </label>
                <div className="relative group">
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    required
                    placeholder="••••••"
                    className="w-full px-5 py-4 bg-gray-50/50 dark:bg-black/20 border border-gray-100 dark:border-white/5 rounded-2xl text-[15px] focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 transition-all dark:text-white outline-none placeholder:text-gray-300 dark:placeholder:text-gray-700 font-medium tracking-[0.5em] text-center font-mono"
                  />
                </div>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-red-50 dark:bg-red-500/10 p-4 rounded-2xl border border-red-100 dark:border-red-500/10 flex gap-3"
                >
                  <Icon
                    name="Alert"
                    size={18}
                    className="text-red-500 shrink-0"
                  />
                  <p className="text-xs font-bold text-red-600 dark:text-red-400 italic leading-relaxed">
                    {error}
                  </p>
                </motion.div>
              )}

              <div className="pt-4 flex flex-col gap-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-blue-500 text-white font-bold rounded-full shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 active:scale-95 hover:bg-blue-600 disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    "Criar Cadastro"
                  )}
                </button>

                <div className="flex flex-col gap-3 border-t border-gray-100 dark:border-white/5 pt-6 text-center">
                  <button
                    type="button"
                    onClick={() => setVerifying(false)}
                    className="text-xs font-bold text-blue-500 hover:text-blue-600 flex items-center justify-center gap-2"
                  >
                    Usar outro e-mail
                  </button>
                </div>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </div>

      {/* Footer microcopy */}
      <div className="px-8 py-5 bg-gray-50/50 dark:bg-black/10 border-t border-gray-100 dark:border-white/5 text-center">
        <p className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
          Seguro • Privado • Codificado
        </p>
      </div>
    </div>
  );
}
