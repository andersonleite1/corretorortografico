"use client";

import { SignIn } from "@clerk/nextjs";
import { X } from "lucide-react";
import EmailCodeSignUp from "./EmailCodeSignUp";

interface AuthOverlayProps {
    isOpen: boolean;
    view: "sign-in" | "sign-up";
    onClose: () => void;
    onSwitchView: (view: "sign-in" | "sign-up") => void;
}

export default function AuthOverlay({ isOpen, view, onClose, onSwitchView }: AuthOverlayProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
            <div
                className="absolute inset-0 bg-neutral-950/40 backdrop-blur-md"
                onClick={onClose}
            />
            <div className="relative z-10 w-full max-w-md">
                {view === "sign-up" ? (
                    <EmailCodeSignUp
                        onClose={onClose}
                        onSignInClick={() => onSwitchView("sign-in")}
                    />
                ) : (
                    <div className="relative animate-in fade-in zoom-in duration-300">
                        <button
                            onClick={onClose}
                            className="absolute right-5 top-5 z-[60] text-neutral-400 hover:text-neutral-600 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        <SignIn
                            appearance={{
                                elements: {
                                    rootBox: "w-full flex justify-center",
                                    card: "bg-white border border-neutral-200 shadow-2xl rounded-3xl w-full relative pb-16",
                                    headerTitle: "text-neutral-900 tracking-tight",
                                    headerSubtitle: "text-neutral-600",
                                    socialButtonsBlockButton: "bg-neutral-50 border-neutral-200 text-neutral-900 hover:bg-neutral-100 rounded-2xl transition-all",
                                    socialButtonsBlockButtonText: "text-neutral-900 font-medium",
                                    dividerLine: "bg-neutral-100",
                                    dividerText: "text-neutral-400",
                                    formFieldLabel: "text-neutral-700",
                                    formFieldInput: "bg-neutral-50 border border-neutral-200 text-neutral-900 rounded-full focus:border-emerald-600 focus:ring-emerald-600/50 transition-all",
                                    formButtonPrimary: "bg-black hover:bg-neutral-800 text-sm font-semibold rounded-full shadow-lg transition-all",
                                    footer: "hidden",
                                },
                            }}
                            routing="hash"
                        />
                        <div className="absolute bottom-6 left-0 right-0 text-center pointer-events-none">
                            <p className="text-sm text-neutral-500 pointer-events-auto">
                                Não possui uma conta?{" "}
                                <button
                                    onClick={() => onSwitchView("sign-up")}
                                    className="text-emerald-600 hover:text-emerald-700 font-semibold transition-colors"
                                >
                                    Criar conta
                                </button>
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
