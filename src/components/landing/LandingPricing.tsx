import Link from "next/link";
import { PricingContent } from "@/data/home/types";

type Props = {
    data: PricingContent;
};

export default function LandingPricing({ data }: Props) {
    return (
        <section className="landing-pricing" aria-labelledby="pricing-heading">
            <div className="landing-section__inner">
                <p className="landing-eyebrow">{data.eyebrow}</p>
                <h2 id="pricing-heading" className="landing-heading">
                    {data.heading}
                </h2>
                <div className="landing-pricing__grid">
                    {data.tiers.map((tier) => (
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
                                    <span className="landing-pricing__price">{tier.price}</span>
                                    {tier.priceNote && (
                                        <span className="landing-pricing__price-note">{tier.priceNote}</span>
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
                                <Link
                                    href={tier.ctaHref}
                                    className={`landing-btn ${tier.highlighted ? "landing-btn--primary" : "landing-btn--outline"}`}
                                >
                                    {tier.ctaLabel}
                                </Link>
                            ) : (
                                <span className="landing-pricing__soon-label">{tier.ctaLabel}</span>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
