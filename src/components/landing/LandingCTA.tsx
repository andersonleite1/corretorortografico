import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { CtaContent } from "@/data/home/types";
import { useState } from "react";
import dynamic from "next/dynamic";

const AuthOverlay = dynamic(() => import("../auth/AuthOverlay"), {
  ssr: false,
});

type Props = {
  data: CtaContent;
};

export default function LandingCTA({ data }: Props) {
  const { isLoaded, isSignedIn } = useAuth();
  const [authModal, setAuthModal] = useState<{
    isOpen: boolean;
    view: "sign-in" | "sign-up";
  }>({
    isOpen: false,
    view: "sign-up",
  });

  if (!isLoaded) return null;

  // Use default data or data.loggedIn if user is signed in
  const displayHeading =
    isSignedIn && data.loggedIn ? data.loggedIn.heading : data.heading;
  const displayLabel =
    isSignedIn && data.loggedIn ? data.loggedIn.ctaLabel : data.ctaLabel;
  const displayHref =
    isSignedIn && data.loggedIn ? data.loggedIn.ctaHref : data.ctaHref;

  const handleClick = (e: React.MouseEvent) => {
    if (!isSignedIn) {
      e.preventDefault();
      setAuthModal({ isOpen: true, view: "sign-up" });
    }
  };

  return (
    <section className="landing-cta" aria-label="Chamada para ação final">
      <div className="landing-cta__inner">
        <h2 className="landing-cta__heading">{displayHeading}</h2>
        <button
          onClick={handleClick}
          className="landing-btn landing-btn--primary landing-btn--lg"
        >
          {displayLabel}
        </button>
      </div>

      <AuthOverlay
        isOpen={authModal.isOpen}
        view={authModal.view}
        onClose={() => setAuthModal((prev) => ({ ...prev, isOpen: false }))}
        onSwitchView={(view) => setAuthModal({ isOpen: true, view })}
      />
    </section>
  );
}
