"use client";

import { useSignUp } from "@clerk/nextjs";
import { useState } from "react";
import { Loader2, Mail } from "lucide-react";
import Link from "next/link";

import { X } from "lucide-react";

interface EmailLinkSignUpProps {
    onClose?: () => void;
    onSignInClick?: () => void;
}

export default function EmailLinkSignUp({ onClose, onSignInClick }: EmailLinkSignUpProps) {
    const { isLoaded, signUp } = useSignUp();
    const [emailAddress, setEmailAddress] = useState("");
    const [sent, setSent] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

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

            // Send the email link
            const { startEmailLinkFlow } = signUp!.createEmailLinkFlow();

            await startEmailLinkFlow({
                redirectUrl: window.location.origin + "/dashboard",
            });

            setSent(true);
        } catch (err: any) {
            console.error(JSON.stringify(err, null, 2));
            setError(err.errors?.[0]?.longMessage || "Ocorreu um erro ao enviar o e-mail.");
        } finally {
            setLoading(false);
        }
    }

    if (sent) {
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
                        <Mail className="w-12 h-12 text-emerald-600" />
                    </div>
                </div>
                <div className="space-y-1">
                    <h2 className="text-xl font-bold text-neutral-900 tracking-tight">Verifique seu e-mail</h2>
                    <p className="text-sm text-neutral-600">
                        Enviamos um link de confirmação para <span className="font-semibold text-neutral-900">{emailAddress}</span>.
                    </p>
                </div>
                <p className="text-xs text-neutral-500">
                    Clique no link recebido para concluir o seu cadastro.
                </p>
                <button
                    onClick={() => setSent(false)}
                    className="text-emerald-600 hover:text-emerald-700 text-sm font-medium transition-colors"
                >
                    Usar outro e-mail
                </button>
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
                    <p className="text-sm text-neutral-600">Entre com o seu e-mail para receber um link de acesso.</p>
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
                            "Enviar link de acesso"
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
