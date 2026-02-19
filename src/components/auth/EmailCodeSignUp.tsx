"use client";

import { useSignUp } from "@clerk/nextjs";
import { useState } from "react";
import { Loader2, Mail, KeyRound, X } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { useMemo } from "react";
import { i18n, Locale } from "../../../i18n-config";
import { getAuthContent } from "@/data/auth";

interface EmailCodeSignUpProps {
    onClose?: () => void;
    onSignInClick?: () => void;
}

export default function EmailCodeSignUp({ onClose, onSignInClick }: EmailCodeSignUpProps) {
    const { isLoaded, signUp, setActive } = useSignUp();
    const router = useRouter();
    const pathname = usePathname() || "/";
    const { locales, defaultLocale } = i18n;

    const currentLocale = useMemo<Locale>(() => {
        const segments = pathname.split("/").filter(Boolean);
        const potential = segments[0] as Locale | undefined;
        return locales.includes(potential as Locale) ? potential! : defaultLocale;
    }, [pathname, locales, defaultLocale]);

    const authContent = getAuthContent(currentLocale);

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
            // Create sign-up attempt
            await signUp!.create({
                emailAddress,
            });

            // Prepare email verification
            await signUp!.prepareEmailAddressVerification({
                strategy: "email_code",
            });

            setVerifying(true);
        } catch (err: any) {
            console.error(JSON.stringify(err, null, 2));
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
                console.error("Sign up status not complete:", JSON.stringify(completeSignUp, null, 2));

                if (completeSignUp.status === "missing_requirements") {
                    const missing = completeSignUp.missingFields;
                    setError(`O cadastro requer mais informações: ${missing?.join(", ") || "campos obrigatórios pendentes"}. Verifique as configurações do Clerk.`);
                } else {
                    setError(`Ocorreu um erro ao completar o cadastro (Status: ${completeSignUp.status}). Por favor, tente novamente.`);
                }
            }
        } catch (err: any) {
            console.error("Verify catch error:", JSON.stringify(err, null, 2));
            setError(getFriendlyErrorMessage(err));
        } finally {
            setLoading(false);
        }
    }

    if (verifying) {
        return (
            <div className="w-full max-w-md p-8 bg-white border border-neutral-200 rounded-3xl shadow-2xl text-center space-y-6 relative animate-in fade-in zoom-in duration-300">
                {onClose && (
                    <button
                        onClick={onClose}
                        className="absolute right-5 top-5 text-neutral-400 hover:text-neutral-600 transition-colors z-[60]"
                    >
                        <X className="w-5 h-5" />
                    </button>
                )}
                <div className="flex justify-center">
                    <div className="p-4 bg-emerald-50 rounded-full ring-1 ring-emerald-100">
                        <KeyRound className="w-12 h-12 text-emerald-600" />
                    </div>
                </div>
                <div className="space-y-1">
                    <h2 className="text-xl font-bold text-neutral-900 tracking-tight">Verifique seu e-mail</h2>
                    <p className="text-sm text-neutral-600">
                        Enviamos um código para <span className="font-semibold text-neutral-900">{emailAddress}</span>.
                    </p>
                </div>

                <form onSubmit={handleVerify} className="space-y-6 text-left">
                    <div className="space-y-2">
                        <label htmlFor="code" className="text-xs font-medium text-neutral-700 uppercase tracking-wider">
                            Código de Verificação
                        </label>
                        <input
                            id="code"
                            type="text"
                            placeholder="Inserir código"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            required
                            className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-full text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-600 transition-all text-sm text-center tracking-[0.5em] font-mono"
                        />
                    </div>

                    {error && (
                        <p className="text-sm text-red-600 bg-red-50 p-3 rounded-2xl border border-red-100">
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex items-center justify-center px-4 py-3 bg-black hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-full shadow-lg transition-all hover:scale-[1.01] active:scale-[0.99]"
                    >
                        {loading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            "Verificar código"
                        )}
                    </button>
                </form>

                <div className="space-y-2">
                    <p className="text-xs text-neutral-500">
                        Não recebeu o código? Verifique sua pasta de spam.
                    </p>
                    <button
                        onClick={() => setVerifying(false)}
                        className="text-emerald-600 hover:text-emerald-700 text-sm font-medium transition-colors"
                    >
                        Usar outro e-mail
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-md bg-white border border-neutral-200 rounded-3xl shadow-2xl relative animate-in fade-in zoom-in duration-300 pb-16">
            {onClose && (
                <button
                    onClick={onClose}
                    className="absolute right-5 top-5 text-neutral-400 hover:text-neutral-600 transition-colors z-[60]"
                >
                    <X className="w-5 h-5" />
                </button>
            )}

            <div className="p-8 pb-4">
                <div className="text-center space-y-1 mb-8">
                    <h1 className="text-xl font-bold text-neutral-900 tracking-tight">
                        Criar sua conta
                    </h1>
                    <p className="text-sm text-neutral-600">Entre com o seu e-mail para receber um código de acesso.</p>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    <div className="space-y-2">
                        <label htmlFor="email" className="text-xs font-medium text-neutral-700 uppercase tracking-wider">
                            Endereço de e-mail
                        </label>
                        <input
                            id="email"
                            type="email"
                            placeholder="nome@exemplo.com"
                            value={emailAddress}
                            onChange={(e) => setEmailAddress(e.target.value)}
                            required
                            className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-full text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-600 transition-all text-sm"
                        />
                    </div>

                    {error && (
                        <p className="text-sm text-red-600 bg-red-50 p-3 rounded-2xl border border-red-100">
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex items-center justify-center px-4 py-3 bg-black hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-full shadow-lg transition-all hover:scale-[1.01] active:scale-[0.99]"
                    >
                        {loading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            "Enviar código de acesso"
                        )}
                    </button>
                </form>
            </div>

            <div className="absolute bottom-6 left-0 right-0 text-center pointer-events-none">
                <p className="text-sm text-neutral-500 pointer-events-auto">
                    Já possui uma conta?{" "}
                    <button
                        onClick={onSignInClick}
                        className="text-emerald-600 hover:text-emerald-700 font-semibold transition-colors"
                    >
                        Entrar
                    </button>
                </p>
            </div>
        </div>
    );
}
