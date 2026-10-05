export function HeroActions({ ctaLabel }: { ctaLabel: string }) {
  return (
    <div className="landing-hero__actions">
      <a href="#editor" className="landing-btn landing-btn--primary">
        {ctaLabel}
      </a>
    </div>
  );
}
