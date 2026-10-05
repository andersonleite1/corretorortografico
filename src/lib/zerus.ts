import { i18n, type Locale } from "../../i18n-config";

export type ZerusPlacement =
  | "header"
  | "mobile_header"
  | "mobile_menu"
  | "editor_bridge"
  | "editor_ai"
  | "selection_ai"
  | "footer_cta"
  | "legacy_auth";

export function getZerusHref(
  locale: Locale,
  placement: ZerusPlacement,
): string {
  const normalized = i18n.locales.includes(locale)
    ? locale
    : i18n.defaultLocale;
  const url = new URL(
    normalized === "pt" ? "/" : `/${normalized}`,
    "https://zerus.app",
  );
  url.search = new URLSearchParams({
    utm_source: "editordetexto",
    utm_medium: "referral",
    utm_campaign: "public_editor",
    utm_content: placement,
  }).toString();
  return url.toString();
}

// Use the installed Umami tracker without sending document IDs, text or URL queries.
export function trackZerusEvent(
  event: "zerus_cta_click" | "zerus_cta_view",
  locale: Locale,
  placement: ZerusPlacement,
) {
  const tracker = (
    window as Window & {
      umami?: {
        track: (
          payload: (
            properties: Record<string, unknown>,
          ) => Record<string, unknown>,
        ) => Promise<unknown>;
      };
    }
  ).umami;
  if (!tracker) return false;
  try {
    void Promise.resolve(
      tracker.track((properties) => ({
        ...properties,
        url: window.location.pathname,
        referrer: "",
        name: event,
        data: { locale, placement },
      })),
    ).catch(() => {});
    return true;
  } catch {
    /* Analytics must never block navigation. */ return false;
  }
}
