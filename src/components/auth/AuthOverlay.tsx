"use client";

import EmailSignIn from "./EmailSignIn";
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
                    <EmailSignIn
                        onClose={onClose}
                        onSignUpClick={() => onSwitchView("sign-up")}
                    />
                )}
            </div>
        </div>
    );
}
