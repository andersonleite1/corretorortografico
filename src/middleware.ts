import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { match } from "@formatjs/intl-localematcher";
import Negotiator from "negotiator";

import { i18n } from "../i18n-config";
import type { I18nConfig } from "../i18n-config";

import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const PUBLIC_FILE = /\.[^/]+$/;

// Rotas que requerem autenticação
const isProtectedRoute = createRouteMatcher([
  "/:locale/editor(.*)",     // Editor principal (com locale)
  "/editor(.*)",             // Editor principal (sem locale)
  "/:locale/dashboard(.*)",  // Painel do usuário
  "/dashboard(.*)",
  "/:locale/settings(.*)",   // Configurações
  "/settings(.*)",
  "/api/ai(.*)",             // APIs de IA
  "/api/documents(.*)",
]);

function getLocale(request: NextRequest, i18nConfig: I18nConfig): string {
  const { locales, defaultLocale } = i18nConfig;

  const negotiatorHeaders: Record<string, string> = {};
  request.headers.forEach((value, key) => (negotiatorHeaders[key] = value));

  const languages = new Negotiator({ headers: negotiatorHeaders }).languages(locales);

  return match(languages, locales, defaultLocale);
}

function i18nMiddleware(request: NextRequest) {
  const { pathname, basePath } = request.nextUrl;

  if (PUBLIC_FILE.test(pathname)) {
    return NextResponse.next();
  }

  let response;
  let nextLocale;

  const { locales, defaultLocale } = i18n;

  const pathLocale = locales.find(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathLocale) {
    const isDefaultLocale = pathLocale === defaultLocale;
    if (isDefaultLocale) {
      let pathWithoutLocale = pathname.slice(`/${pathLocale}`.length) || "/";
      if (request.nextUrl.search) pathWithoutLocale += request.nextUrl.search;

      const url = basePath + pathWithoutLocale;

      response = NextResponse.redirect(new URL(url, request.url));
    }

    nextLocale = pathLocale;
  } else {
    const isFirstVisit = !request.cookies.has("NEXT_LOCALE");

    const locale = isFirstVisit ? getLocale(request, i18n) : defaultLocale;

    let newPath = `/${locale}${pathname}`;
    if (request.nextUrl.search) newPath += request.nextUrl.search;

    const url = basePath + newPath;

    response =
      locale === defaultLocale
        ? NextResponse.rewrite(new URL(url, request.url))
        : NextResponse.redirect(new URL(url, request.url));
    nextLocale = locale;
  }

  if (!response) response = NextResponse.next();

  if (nextLocale) response.cookies.set("NEXT_LOCALE", nextLocale);

  return response;
}

export default clerkMiddleware(async (auth, request) => {
  if (isProtectedRoute(request)) {
    await auth.protect();
  }
  return i18nMiddleware(request);
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
