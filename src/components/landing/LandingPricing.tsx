"use client";

import Link from "next/link";
import { PricingContent } from "@/data/home/types";
import { useAuth } from "@clerk/nextjs";
import { useState } from "react";
import dynamic from "next/dynamic";

const AuthOverlay = dynamic(() => import("../auth/AuthOverlay"), {
  ssr: false,
});
const ProWaitlistDialog = dynamic(() => import("../auth/ProWaitlistDialog"), {
  ssr: false,
});

type Props = {
  data: PricingContent;
};

export default function LandingPricing({ data }: Props) {
  const { isLoaded, isSignedIn } = useAuth();
  const [authModal, setAuthModal] = useState<{
    isOpen: boolean;
    view: "sign-in" | "sign-up";
  }>({
    isOpen: false,
    view: "sign-up",
  });
  const [proModalOpen, setProModalOpen] = useState(false);

  const handleCtaClick = (
    e: React.MouseEvent,
    tierName: string,
    ctaHref: string,
  ) => {
    e.preventDefault();
    if (!isLoaded) return;

    const isPro = tierName.toUpperCase() === "PRO";
    const isFree = tierName.toUpperCase() === "FREE";

    if (!isSignedIn) {
      setAuthModal({ isOpen: true, view: "sign-up" });
      return;
    }

    if (isPro) {
      setProModalOpen(true);
    } else if (isFree) {
      // For free users who are already logged in, take them to the editor
      // We can scroll to the editor ID if available or redirect to /dashboard
      window.location.href = "#editor";
    } else {
      window.location.href = ctaHref;
    }
  };

  return (
    <>
      <section
        id="pricing"
        className="landing-pricing"
        aria-labelledby="pricing-heading"
      >
        <div className="landing-section__inner">
          <p className="landing-eyebrow">{data.eyebrow}</p>
          <h2 id="pricing-heading" className="landing-heading">
            {data.heading}
          </h2>
          <div className="landing-pricing__grid">
            {data.tiers.map((tier) => {
              const isPro = tier.name.toUpperCase() === "PRO";

              return (
                <div
                  key={tier.name}
                  className={`landing-pricing__card${tier.highlighted ? " landing-pricing__card--pro" : ""}${tier.comingSoon ? " landing-pricing__card--soon" : ""}`}
                >
                  {tier.badge && (
                    <span className="landing-pricing__badge">{tier.badge}</span>
                  )}
                  <p className="landing-pricing__name">{tier.name}</p>
                  <p className="landing-pricing__focus">{tier.focus}</p>
                  {tier.price !== null ? (
                    <div className="landing-pricing__price-wrap">
                      <span className="landing-pricing__price">
                        {tier.price}
                      </span>
                      {tier.priceNote && (
                        <span className="landing-pricing__price-note">
                          {tier.priceNote}
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="landing-pricing__price-wrap">
                      <span className="landing-pricing__price">Grátis</span>
                    </div>
                  )}
                  <ul className="landing-pricing__items">
                    {tier.items.map((item) => (
                      <li key={item} className="landing-pricing__item">
                        <svg
                          className="landing-pricing__check"
                          viewBox="0 0 16 16"
                          fill="none"
                          aria-hidden="true"
                        >
                          <path
                            d="M3 8l3.5 3.5L13 4.5"
                            stroke="currentColor"
                            strokeWidth="1.75"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        {item}
                      </li>
                    ))}
                  </ul>
                  {!tier.comingSoon ? (
                    <button
                      onClick={(e) =>
                        handleCtaClick(e, tier.name, tier.ctaHref)
                      }
                      className={`landing-btn w-full ${tier.highlighted ? "landing-btn--primary" : "landing-btn--outline"}`}
                    >
                      {tier.ctaLabel}
                    </button>
                  ) : (
                    <span className="landing-pricing__soon-label">
                      {tier.ctaLabel}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <AuthOverlay
        isOpen={authModal.isOpen}
        view={authModal.view}
        onClose={() => setAuthModal((prev) => ({ ...prev, isOpen: false }))}
        onSwitchView={(view) => setAuthModal({ isOpen: true, view })}
      />

      <ProWaitlistDialog
        isOpen={proModalOpen}
        onClose={() => setProModalOpen(false)}
      />
    </>
  );
}
