import { Locale } from "../../../i18n-config";

export type FooterLink = {
  path: string;
  label: string;
};

export type FooterContent = {
  locale: Locale;
  brandName: string;
  links: FooterLink[];
  rightsText: string;
};
