import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { i18n } from "../i18n-config";

const PUBLIC_FILE = /\.[^/]+$/;

// Rotas que requerem autenticação
const isProtectedRoute = createRouteMatcher([
  "/:locale/editor(.*)", // Editor principal (com locale)
  "/editor(.*)", // Editor principal (sem locale)
  "/:locale/dashboard(.*)", // Dashboard
  "/dashboard(.*)",
  "/:locale/settings(.*)", // Configurações
  "/settings(.*)",
  "/api/ai(.*)", // APIs de IA
  "/api/documents(.*)",
  "/api/editor-settings(.*)", // Configurações do editor (multi-tenant)
  "/api/images(.*)",
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

  // Redirecionamento de /pricing para /#pricing (Legado -> Home)
  if (pathname.endsWith("/pricing")) {
    const locale =
      locales.find((l) => pathname.startsWith(`/${l}/`)) || defaultLocale;
    const newPath =
      pathname === "/pricing" || pathname === `/${locale}/pricing`
        ? `/${locale}`
        : pathname.replace("/pricing", "");
    const url = new URL(newPath, request.url);
    url.hash = "pricing";
    url.search = request.nextUrl.search;
    return NextResponse.redirect(url);
  }

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
    cookieLocale && locales.includes(cookieLocale as any)
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
      const signInUrl = new URL("/sign-in", request.url);
      signInUrl.searchParams.set("redirect_url", request.url);
      return NextResponse.redirect(signInUrl);
    }
  }
  return i18nMiddleware(request);
});

export default async function middleware(request: NextRequest, event: any) {
  try {
    return await clerkHof(request, event);
  } catch (err: any) {
    console.error("Middleware Error caught:", err);
    // Retorna uma resposta amigável com o erro no header para debugarmos sem quebrar o Edge Runtime
    const res = NextResponse.next();
    res.headers.set("x-middleware-error", encodeURIComponent(err.message || String(err)));
    return res;
  }
}

export const config = {
  matcher: [
    // Pular Next.js internals e arquivos estáticos
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Sempre rodar para API routes
    "/(api|trpc)(.*)",
  ],
};
