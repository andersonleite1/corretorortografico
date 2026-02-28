import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { CtaContent } from "@/data/home/types";

type Props = {
  data: CtaContent;
};

export default function LandingCTA({ data }: Props) {
  const { isLoaded, isSignedIn } = useUser();

  // Use default data or data.loggedIn if user is signed in
  const displayHeading =
    isSignedIn && data.loggedIn ? data.loggedIn.heading : data.heading;
  const displayLabel =
    isSignedIn && data.loggedIn ? data.loggedIn.ctaLabel : data.ctaLabel;
  const displayHref =
    isSignedIn && data.loggedIn ? data.loggedIn.ctaHref : data.ctaHref;

  if (!isLoaded) return null;

  return (
    <section className="landing-cta" aria-label="Chamada para ação final">
      <div className="landing-cta__inner">
        <h2 className="landing-cta__heading">{displayHeading}</h2>
        <Link
          href={displayHref}
          className="landing-btn landing-btn--primary landing-btn--lg"
        >
          {displayLabel}
        </Link>
      </div>
    </section>
  );
}
