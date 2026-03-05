import { Locale } from "../../../i18n-config";

type SectionPoint = string | { highlight: string; text: string };

export type ArticleSection = {
  title: string;
  description?: string;
  points?: SectionPoint[];
};

export type ArticleContent = {
  title: string;
  introHtml: string;
  sections: ArticleSection[];
  finalNoteHtml: string;
};

export type FaqItem = {
  question: string;
  answer: string;
};

export type FaqContent = {
  label: string;
  heading: string;
  description: string;
  items: FaqItem[];
};

export type SeoContent = {
  title: string;
  description: string;
  keywords: string[];
  openGraphTitle?: string;
  openGraphDescription?: string;
};

export type WebAppSchemaContent = {
  name: string;
  description: string;
  applicationCategory: string;
  featureList: string[];
  keywords: string[];
};

// --- New Landing Page Sections ---

export type HeroContent = {
  headline: string;
  subheadline: string;
  ctaLabel: string;
  ctaHref: string;
  microcopy: string;
};

export type ProblemContent = {
  eyebrow: string;
  heading: string;
  pains: { icon: string; title: string; description: string }[];
};

export type FeaturePillar = {
  icon: string;
  title: string;
  description: string;
};

export type FeaturesContent = {
  eyebrow: string;
  heading: string;
  pillars: FeaturePillar[];
};

export type PricingTier = {
  name: string;
  focus: string;
  price: string | null;
  priceNote?: string;
  badge?: string;
  items: string[];
  ctaLabel: string;
  ctaHref: string;
  highlighted: boolean;
  comingSoon?: boolean;
};

export type PricingContent = {
  eyebrow: string;
  heading: string;
  tiers: PricingTier[];
};

export type CtaContent = {
  heading: string;
  ctaLabel: string;
  ctaHref: string;
  loggedIn?: {
    heading: string;
    ctaLabel: string;
    ctaHref: string;
  };
};

export type HomeContent = {
  locale: Locale;
  seo: SeoContent;
  webAppSchema: WebAppSchemaContent;
  article: ArticleContent;
  faq: FaqContent;
  hero?: HeroContent;
  problem?: ProblemContent;
  features?: FeaturesContent;
  pricing?: PricingContent;
  cta?: CtaContent;
};
