import Image from "next/image";
import Link from "next/link";
import { HeroContent } from "@/data/home/types";
import { useAuth } from "@clerk/nextjs";
import { useState } from "react";
import dynamic from "next/dynamic";

const AuthOverlay = dynamic(() => import("../auth/AuthOverlay"), {
  ssr: false,
});

type Props = {
  data: HeroContent;
};

export default function LandingHero({ data }: Props) {
  const { isLoaded, isSignedIn } = useAuth();
  const [authModal, setAuthModal] = useState<{
    isOpen: boolean;
    view: "sign-in" | "sign-up";
  }>({
    isOpen: false,
    view: "sign-up",
  });

  const handleClick = (e: React.MouseEvent) => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      e.preventDefault();
      setAuthModal({ isOpen: true, view: "sign-up" });
    }
  };

  return (
    <>
      <section
        className="landing-hero"
        aria-label="Apresentação do editor de texto online"
      >
        <div className="landing-hero__inner">
          <div className="landing-hero__text">
            <p className="landing-hero__eyebrow">
              Editor de Texto Online Grátis
            </p>
            <h2 className="landing-hero__headline">{data.headline}</h2>
            <p className="landing-hero__subheadline">{data.subheadline}</p>
            <div className="landing-hero__actions">
              <button
                disabled={true}
                className="landing-btn landing-btn--primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {data.ctaLabel}
              </button>
            </div>
            <p className="landing-hero__microcopy">{data.microcopy}</p>
          </div>
          <div className="landing-hero__visual" aria-hidden="true">
            <div className="landing-hero__screenshot-wrap">
              <Image
                src="/macbook-mockup.webp"
                alt="Mockup de um MacBook Pro mostrando a interface do editor de texto online"
                width={960}
                height={960}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 960px"
                className="landing-hero__screenshot"
                quality={80}
              />
            </div>
          </div>
        </div>
      </section>

      <AuthOverlay
        isOpen={authModal.isOpen}
        view={authModal.view}
        onClose={() => setAuthModal((prev) => ({ ...prev, isOpen: false }))}
        onSwitchView={(view) => setAuthModal({ isOpen: true, view })}
      />
    </>
  );
}
