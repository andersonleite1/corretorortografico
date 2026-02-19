"use client";

import { useSignIn } from "@clerk/nextjs";
import { useState } from "react";
import { Loader2, Mail, KeyRound, Lock, Eye, EyeOff, X } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { i18n, Locale } from "../../../i18n-config";
import { getAuthContent } from "@/data/auth";
import { useMemo } from "react";

interface EmailSignInProps {
    onClose?: () => void;
    onSignUpClick?: () => void;
}

type SignInStep = "email" | "code" | "password";

export default function EmailSignIn({ onClose, onSignUpClick }: EmailSignInProps) {
    const { isLoaded, signIn, setActive } = useSignIn();
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
    const [password, setPassword] = useState("");
    const [code, setCode] = useState("");
    const [step, setStep] = useState<SignInStep>("email");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const getFriendlyErrorMessage = (err: any) => {
        const errorItem = err.errors?.[0];
        if (!errorItem) return authContent.errors.unexpected;

        const code = errorItem.code;

        switch (code) {
            case "form_identifier_not_found":
                return authContent.errors.identifier_not_found;
            case "form_password_incorrect":
                return authContent.errors.password_incorrect;
            case "form_code_incorrect":
                return authContent.errors.code_incorrect;
            case "form_identifier_invalid":
                return authContent.errors.identifier_invalid;
            case "verification_strategy_not_valid":
                return authContent.errors.invalid_strategy;
            default:
                // Handle the case from the screenshot which might be another code or longMessage fallback
                if (errorItem.longMessage?.includes("verification strategy is not valid")) {
                    return authContent.errors.invalid_strategy;
                }
                return errorItem.longMessage || authContent.errors.unexpected;
        }
    };

    if (!isLoaded) return null;

    async function handleEmailSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            await signIn!.create({
                identifier: emailAddress,
            });

            // Default strategy: email_code
            const factor = signIn!.supportedFirstFactors?.find(
                (f: any) => f.strategy === "email_code"
            ) as any;

            await signIn!.prepareFirstFactor({
                strategy: "email_code",
                emailAddressId: factor?.emailAddressId,
            } as any);

            setStep("code");
        } catch (err: any) {
            console.error("Sign-in error:", JSON.stringify(err, null, 2));
            setError(getFriendlyErrorMessage(err));
        } finally {
            setLoading(false);
        }
    }

    async function handleCodeVerify(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const result = await signIn!.attemptFirstFactor({
                strategy: "email_code",
                code: code.replace(/\s/g, ""),
            });

            if (result.status === "complete") {
                await setActive!({ session: result.createdSessionId });
                router.push("/");
                if (onClose) onClose();
            } else {
                setError("Não foi possível completar o acesso. Verifique os dados.");
            }
        } catch (err: any) {
            console.error("Code verify error:", JSON.stringify(err, null, 2));
            setError(getFriendlyErrorMessage(err));
        } finally {
            setLoading(false);
        }
    }

    async function handlePasswordSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const result = await signIn!.attemptFirstFactor({
                strategy: "password",
                password,
            });

            if (result.status === "complete") {
                await setActive!({ session: result.createdSessionId });
                router.push("/");
                if (onClose) onClose();
            } else {
                setError("Não foi possível completar o acesso. Verifique sua senha.");
            }
        } catch (err: any) {
            console.error("Password submit error:", JSON.stringify(err, null, 2));
            setError(getFriendlyErrorMessage(err));
        } finally {
            setLoading(false);
        }
    }

    const switchToPassword = async () => {
        setError("");
        setStep("password");
    };

    const switchToCode = async () => {
        setError("");
        setLoading(true);
        try {
            const factor = signIn!.supportedFirstFactors?.find(
                (f: any) => f.strategy === "email_code"
            ) as any;

            await signIn!.prepareFirstFactor({
                strategy: "email_code",
                emailAddressId: factor?.emailAddressId,
            } as any);
            setStep("code");
        } catch (err: any) {
            setError(getFriendlyErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    // Step 1: Email Input
    if (step === "email") {
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
                            Entrar na sua conta
                        </h1>
                        <p className="text-sm text-neutral-600">Entre com o seu e-mail para acessar.</p>
                    </div>

                    <form onSubmit={handleEmailSubmit} className="space-y-6">
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
                                "Continuar"
                            )}
                        </button>
                    </form>
                </div>

                <div className="absolute bottom-6 left-0 right-0 text-center pointer-events-none">
                    <p className="text-sm text-neutral-500 pointer-events-auto">
                        Não possui uma conta?{" "}
                        <button
                            onClick={onSignUpClick}
                            className="text-emerald-600 hover:text-emerald-700 font-semibold transition-colors"
                        >
                            Criar conta
                        </button>
                    </p>
                </div>
            </div>
        );
    }

    // Step 2 & 3: Code/Password Verification
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
                    {step === "code" ? (
                        <KeyRound className="w-12 h-12 text-emerald-600" />
                    ) : (
                        <Lock className="w-12 h-12 text-emerald-600" />
                    )}
                </div>
            </div>

            <div className="space-y-1">
                <h2 className="text-xl font-bold text-neutral-900 tracking-tight">
                    {step === "code" ? "Verifique seu e-mail" : "Digite sua senha"}
                </h2>
                <p className="text-sm text-neutral-600">
                    {step === "code"
                        ? <>Enviamos um código para <span className="font-semibold text-neutral-900">{emailAddress}</span></>
                        : <>Acesse sua conta com sua senha para <span className="font-semibold text-neutral-900">{emailAddress}</span></>
                    }
                </p>
            </div>

            <form onSubmit={step === "code" ? handleCodeVerify : handlePasswordSubmit} className="space-y-6 text-left">
                {step === "code" ? (
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
                ) : (
                    <div className="space-y-2">
                        <label htmlFor="password" className="text-xs font-medium text-neutral-700 uppercase tracking-wider">
                            Senha
                        </label>
                        <div className="relative">
                            <input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                placeholder="Sua senha"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-full text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-600 transition-all text-sm"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
                            >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>
                )}

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
                        step === "code" ? "Verificar código" : "Entrar"
                    )}
                </button>
            </form>

            <div className="space-y-4 pt-2">
                {step === "code" ? (
                    <button
                        type="button"
                        onClick={switchToPassword}
                        className="text-xs font-medium text-neutral-500 hover:text-neutral-700 transition-colors flex items-center justify-center gap-2 mx-auto"
                    >
                        <Lock className="w-3 h-3" />
                        Prefiro usar uma senha
                    </button>
                ) : (
                    <button
                        type="button"
                        onClick={switchToCode}
                        disabled={loading}
                        className="text-xs font-medium text-neutral-500 hover:text-neutral-700 transition-colors flex items-center justify-center gap-2 mx-auto"
                    >
                        <KeyRound className="w-3 h-3" />
                        Usar código de verificação
                    </button>
                )}

                <div className="flex flex-col gap-2 border-t border-neutral-100 pt-4">
                    <button
                        onClick={() => {
                            setStep("email");
                            setCode("");
                            setPassword("");
                            setError("");
                        }}
                        className="text-emerald-600 hover:text-emerald-700 text-sm font-medium transition-colors"
                    >
                        Usar outro e-mail
                    </button>
                </div>
            </div>
        </div>
    );
}
