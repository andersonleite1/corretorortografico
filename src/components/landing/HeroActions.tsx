"use client";

import { useAuth } from "@clerk/nextjs";
import { useState } from "react";
import dynamic from "next/dynamic";

const AuthOverlay = dynamic(() => import("../auth/AuthOverlay"), {
    ssr: false,
});

interface HeroActionsProps {
    ctaLabel: string;
}

export function HeroActions({ ctaLabel }: HeroActionsProps) {
    const { isLoaded, isSignedIn } = useAuth();
    const [authModal, setAuthModal] = useState<{
        isOpen: boolean;
        view: "sign-in" | "sign-up";
    }>({
        isOpen: false,
        view: "sign-up",
    });

    const handleClick = (e: React.MouseEvent) => {
        // Manter desabilitado conforme pedido anterior se necessário, 
        // mas aqui vamos focar na estrutura.
        if (!isLoaded) return;
        if (!isSignedIn) {
            e.preventDefault();
            setAuthModal({ isOpen: true, view: "sign-up" });
        }
    };

    return (
        <>
            <div className="landing-hero__actions">
                {/* Mantendo o botão conforme o estado atual do projeto */}
                <button
                    onClick={handleClick}
                    className="landing-btn landing-btn--primary"
                >
                    {ctaLabel}
                </button>
            </div>

            <AuthOverlay
                isOpen={authModal.isOpen}
                view={authModal.view}
                onClose={() => setAuthModal((prev) => ({ ...prev, isOpen: false }))}
                onSwitchView={(view) => setAuthModal({ isOpen: true, view })}
            />
        </>
    );
}
