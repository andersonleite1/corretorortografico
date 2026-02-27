import { ProblemContent } from "@/data/home/types";

type Props = {
    data: ProblemContent;
};

export default function LandingProblem({ data }: Props) {
    return (
        <section className="landing-problem" aria-labelledby="problem-heading">
            <div className="landing-section__inner">
                <p className="landing-eyebrow">{data.eyebrow}</p>
                <h2 id="problem-heading" className="landing-heading">
                    {data.heading}
                </h2>
                <div className="landing-problem__grid">
                    {data.pains.map((pain) => (
                        <div key={pain.title} className="landing-problem__card">
                            <span className="landing-problem__icon" aria-hidden="true">
                                {pain.icon}
                            </span>
                            <h3 className="landing-problem__card-title">{pain.title}</h3>
                            <p className="landing-problem__card-desc">{pain.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
