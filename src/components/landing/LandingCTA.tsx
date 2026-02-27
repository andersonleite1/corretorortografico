import Link from "next/link";
import { CtaContent } from "@/data/home/types";

type Props = {
    data: CtaContent;
};

export default function LandingCTA({ data }: Props) {
    return (
        <section className="landing-cta" aria-label="Chamada para ação final">
            <div className="landing-cta__inner">
                <h2 className="landing-cta__heading">{data.heading}</h2>
                <Link href={data.ctaHref} className="landing-btn landing-btn--primary landing-btn--lg">
                    {data.ctaLabel}
                </Link>
            </div>
        </section>
    );
}
