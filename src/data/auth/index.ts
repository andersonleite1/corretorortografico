import { i18n, Locale } from "../../../i18n-config";
import en from "./en";
import es from "./es";
import pt from "./pt";
import { AuthContent } from "./types";

const contentMap: Record<Locale, AuthContent> = {
    pt,
    en,
    es,
};

export function getAuthContent(locale: string): AuthContent {
    const normalized = (locale ?? i18n.defaultLocale) as Locale;
    if (contentMap[normalized]) {
        return contentMap[normalized];
    }

    return contentMap[i18n.defaultLocale];
}

export type { AuthContent } from "./types";
