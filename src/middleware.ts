import { NextResponse } from "next/server";
import type { NextRequest, NextFetchEvent } from "next/server";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { i18n, type Locale } from "../i18n-config";
import { getZerusHref } from "@/lib/zerus";
import { STRICT_TRANSPORT_SECURITY } from "@/lib/security-headers.mjs";

const PUBLIC_FILE = /\.[^/]+$/;

// Rotas que requerem autenticação
const isProtectedRoute = createRouteMatcher([
  "/api/ai(.*)",
  "/api/documents(.*)",
  "/api/editor-settings(.*)",
  "/api/images(.*)",
  "/api/dashboard(.*)",
  "/api/user(.*)",
  "/api/stripe/checkout(.*)",
  "/api/stripe/portal(.*)",
]);

/**
 * Detecta o melhor locale sem dependências externas (Edge compatible)
 */
function getLocale(request: NextRequest): string {
  const { locales, defaultLocale } = i18n;
  const acceptLanguage = request.headers.get("accept-language");

  if (!acceptLanguage) return defaultLocale;

  // Parsing simples: pega o primeiro idioma suportado no header ou o default
  const languages = acceptLanguage
    .split(",")
    .map((l) => l.split(";")[0].trim().split("-")[0]);
  const matched = languages.find((lang) =>
    (locales as readonly string[]).includes(lang),
  );

  return matched || defaultLocale;
}

/**
 * Middleware de i18n simplificado para evitar loops e crashes no Edge
 */
function i18nMiddleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const { locales, defaultLocale } = i18n;

  // Pular arquivos estáticos e rotas internas
  if (
    PUBLIC_FILE.test(pathname) ||
    pathname.startsWith("/api") ||
    pathname.includes("_next") ||
    pathname.startsWith("/_clerk") ||
    pathname.includes("clerk_catchall_check")
  ) {
    return NextResponse.next();
  }

  // Verifica se o pathname já começa com um locale suportado
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`,
  );

  if (pathnameHasLocale) {
    // Normalização: se é o default locale na URL, remove (canonical URL)
    if (
      pathname.startsWith(`/${defaultLocale}/`) ||
      pathname === `/${defaultLocale}`
    ) {
      const newPath =
        pathname === `/${defaultLocale}`
          ? "/"
          : pathname.replace(`/${defaultLocale}/`, "/");
      const url = new URL(newPath, request.url);
      url.search = request.nextUrl.search; // Preserva query params
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // Se não tem locale, resolve qual usar
  const cookieLocale = request.cookies.get("NEXT_LOCALE")?.value;
  const locale =
    cookieLocale && locales.includes(cookieLocale as Locale)
      ? cookieLocale
      : pathname === "/"
        ? defaultLocale
        : getLocale(request);

  // Redireciona para o locale correto
  // Se for o default locale, faz rewrite (não aparece na URL)
  if (locale === defaultLocale) {
    const url = new URL(`/${defaultLocale}${pathname}`, request.url);
    url.search = request.nextUrl.search;
    return NextResponse.rewrite(url);
  }

  // Se for idioma secundário, redireciona (aparece na URL)
  const url = new URL(`/${locale}${pathname}`, request.url);
  url.search = request.nextUrl.search;
  return NextResponse.redirect(url);
}

const clerkHof = clerkMiddleware(async (auth, request) => {
  if (isProtectedRoute(request)) {
    const authObj = await auth();
    if (!authObj.userId) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  }
  return i18nMiddleware(request);
});

export default async function middleware(
  request: NextRequest,
  event: NextFetchEvent,
) {
  // Next.js 14 config redirects omit custom headers. Send HSTS explicitly.
  const hostname = request.headers.get("host")?.split(":")[0].toLowerCase();
  if (hostname === "www.editordetexto.online") {
    const canonicalUrl = new URL("https://editordetexto.online");
    canonicalUrl.pathname = request.nextUrl.pathname;
    canonicalUrl.search = request.nextUrl.search;
    const response = NextResponse.redirect(canonicalUrl, 308);
    response.headers.set("Strict-Transport-Security", STRICT_TRANSPORT_SECURITY);
    return response;
  }

  const pathname = request.nextUrl.pathname;
  if (!pathname.startsWith("/api/") && !pathname.startsWith("/trpc")) {
    const segments = pathname.split("/").filter(Boolean);
    const hasLocale = i18n.locales.includes(segments[0] as Locale);
    const preferredLocale = request.cookies.get("NEXT_LOCALE")?.value;
    const locale = hasLocale
      ? (segments[0] as Locale)
      : i18n.locales.includes(preferredLocale as Locale)
        ? (preferredLocale as Locale)
        : (getLocale(request) as Locale);
    const route = segments[hasLocale ? 1 : 0];
    if (
      route === "sign-in" ||
      route === "sign-up" ||
      route === "sso-callback"
    ) {
      return NextResponse.redirect(getZerusHref(locale, "legacy_auth"));
    }
    if (route === "dashboard" || route === "settings" || route === "editor") {
      const home = locale === i18n.defaultLocale ? "/" : `/${locale}`;
      const url = new URL(home, request.url);
      if (route === "editor") {
        const docId = request.nextUrl.searchParams.get("docId");
        if (docId) url.searchParams.set("docId", docId);
        url.hash = "editor";
      } else {
        url.searchParams.set("legacy", "account");
      }
      return NextResponse.redirect(url);
    }
    if (route === "pricing")
      return NextResponse.redirect(getZerusHref(locale, "legacy_auth"));
    return i18nMiddleware(request);
  }
  try {
    return await clerkHof(request, event);
  } catch {
    // Never bypass authorization when Clerk is unavailable.
    return NextResponse.json({ error: "service_unavailable" }, { status: 503 });
  }
}

export const config = {
  matcher: [
    // Canonicalize every www path, including assets skipped by the normal matcher.
    {
      source: "/:path*",
      has: [{ type: "host", value: "www\\.editordetexto\\.online" }],
    },
    // Pular Next.js internals e arquivos estáticos
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Sempre rodar para API routes
    "/(api|trpc)(.*)",
  ],
};
