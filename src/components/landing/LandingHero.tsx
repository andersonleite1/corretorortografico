import Image from "next/image";
import { HeroContent } from "@/data/home/types";
import { HeroActions } from "./HeroActions";
import { useEffect, useState } from "react";

type Props = {
  data: HeroContent;
};

export default function LandingHero({ data }: Props) {
  return (
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

          <HeroActions ctaLabel={data.ctaLabel} />

          <p className="landing-hero__microcopy">{data.microcopy}</p>
        </div>
        <div className="landing-hero__visual hidden lg:block" aria-hidden="true">
          <div className="landing-hero__screenshot-wrap">
            <Image
              src="/macbook-mockup.webp"
              alt="Mockup de um MacBook Pro mostrando a interface do editor de texto online"
              width={960}
              height={960}
              sizes="(max-width: 640px) 90vw, (max-width: 768px) 100vw, (max-width: 1200px) 50vw, 800px"
              className="landing-hero__screenshot"
              priority={true}
              quality={85}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
