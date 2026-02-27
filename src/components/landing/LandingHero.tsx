import Image from "next/image";
import Link from "next/link";
import { HeroContent } from "@/data/home/types";

type Props = {
    data: HeroContent;
};

export default function LandingHero({ data }: Props) {
    return (
        <section className="landing-hero" aria-label="Apresentação do editor de texto online">
            <div className="landing-hero__inner">
                <div className="landing-hero__text">
                    <p className="landing-hero__eyebrow">Editor de Texto Online Grátis</p>
                    <h2 className="landing-hero__headline">{data.headline}</h2>
                    <p className="landing-hero__subheadline">{data.subheadline}</p>
                    <div className="landing-hero__actions">
                        <Link href={data.ctaHref} className="landing-btn landing-btn--primary">
                            {data.ctaLabel}
                        </Link>
                    </div>
                    <p className="landing-hero__microcopy">{data.microcopy}</p>
                </div>
                <div className="landing-hero__visual" aria-hidden="true">
                    <div className="landing-hero__screenshot-wrap">
                        <Image
                            src="/editor-screenshot.jpg"
                            alt="Interface do editor de texto online com modo escuro e barra de revisão gramatical"
                            width={960}
                            height={600}
                            priority
                            className="landing-hero__screenshot"
                            quality={85}
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}
