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
  "/:locale/settings(.*)",   // Configurações
  "/settings(.*)",
  "/api/ai(.*)",             // APIs de IA
  "/api/documents(.*)",
  "/api/editor-settings(.*)",  // Configurações do editor (multi-tenant)
  "/api/images(.*)",
]);

function getLocale(request: NextRequest, i18nConfig: I18nConfig): string {
  const acceptLanguage = request.headers.get("accept-language");
  if (!acceptLanguage) return i18nConfig.defaultLocale;

  // Basic parsing for Edge Runtime compatibility (avoids negotiator dependency)
  const preferredLocales = acceptLanguage
    .split(",")
    .map((lang) => lang.split(";")[0].trim().split("-")[0]); // Use 'pt' instead of 'pt-BR' to match i18n-config

  return match(preferredLocales, i18nConfig.locales, i18nConfig.defaultLocale);
}

function i18nMiddleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    PUBLIC_FILE.test(pathname) ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/_clerk") ||
    pathname.includes("clerk_catchall_check")
  ) {
    return NextResponse.next();
  }

  const { locales, defaultLocale } = i18n;
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale) {
    if (pathname.startsWith(`/${defaultLocale}/`) || pathname === `/${defaultLocale}`) {
      const newPath = pathname === `/${defaultLocale}`
        ? "/"
        : pathname.replace(`/${defaultLocale}/`, "/");
      return NextResponse.redirect(new URL(newPath, request.url));
    }
    return NextResponse.next();
  }

  const locale = request.cookies.get("NEXT_LOCALE")?.value || getLocale(request, i18n);

  if (locale === defaultLocale) {
    return NextResponse.rewrite(new URL(`/${defaultLocale}${pathname}`, request.url));
  }

  return NextResponse.redirect(new URL(`/${locale}${pathname}`, request.url));
}

export default clerkMiddleware(async (authProxy, request) => {
  try {
    const isProtected = isProtectedRoute(request);

    if (isProtected) {
      const authData = await authProxy();
      if (!authData.userId) {
        return authData.redirectToSignIn();
      }
    }

    return i18nMiddleware(request);
  } catch (error) {
    console.error("[MIDDLEWARE_ERROR]", error);
    // Em caso de erro crítico no middleware, deixe passar ou redirecione para erro
    return NextResponse.next();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
