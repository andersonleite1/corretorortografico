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

export type HomeContent = {
  locale: Locale;
  seo: SeoContent;
  article: ArticleContent;
  faq: FaqContent;
};
