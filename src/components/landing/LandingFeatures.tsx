import { FeaturesContent } from "@/data/home/types";

type Props = {
    data: FeaturesContent;
};

export default function LandingFeatures({ data }: Props) {
    return (
        <section className="landing-features" aria-labelledby="features-heading">
            <div className="landing-section__inner">
                <p className="landing-eyebrow">{data.eyebrow}</p>
                <h2 id="features-heading" className="landing-heading">
                    {data.heading}
                </h2>
                <div className="landing-features__grid">
                    {data.pillars.map((pillar) => (
                        <article key={pillar.title} className="landing-features__card">
                            <div className="landing-features__icon" aria-hidden="true">
                                {pillar.icon}
                            </div>
                            <h3 className="landing-features__card-title">{pillar.title}</h3>
                            <p className="landing-features__card-desc">{pillar.description}</p>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}
