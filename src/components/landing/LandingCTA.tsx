import { CtaContent } from "@/data/home/types";
import { type Locale } from "../../../i18n-config";
import { getAcquisitionContent } from "@/data/acquisition";
import ZerusLink from "../shared/ZerusLink";

export default function LandingCTA({
  data,
  locale,
}: {
  data: CtaContent;
  locale: Locale;
}) {
  const t = getAcquisitionContent(locale);
  return (
    <section className="landing-cta" aria-label={t.cta}>
      <div className="landing-cta__inner">
        <h2 className="landing-cta__heading">{data.heading}</h2>
        <ZerusLink
          locale={locale}
          placement="footer_cta"
          className="landing-btn landing-btn--primary landing-btn--lg"
        >
          {t.cta}
        </ZerusLink>
        <p className="landing-cta__note">
          {t.note}
        </p>
      </div>
    </section>
  );
}
