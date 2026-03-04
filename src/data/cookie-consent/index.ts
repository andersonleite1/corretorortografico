import { pt } from "./pt";
import { en } from "./en";
import { es } from "./es";
import { Locale } from "../../../i18n-config";

export const getCookieConsentContent = (locale: Locale) => {
  switch (locale) {
    case "en":
      return en;
    case "es":
      return es;
    default:
      return pt;
  }
};
