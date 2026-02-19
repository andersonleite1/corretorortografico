import Link from "next/link";
import { cookies } from "next/headers";
import { BackHomeButton } from "@/components/shared/BackHomeButton";
import { Locale, i18n } from "../../i18n-config";

const TRANSLATIONS = {
    pt: {
        title: "Página não encontrada",
        description: "Desculpe, a página que você está procurando não existe ou foi movida.",
        eyebrow: "Erro 404",
    },
    en: {
        title: "Page not found",
        description: "Sorry, the page you are looking for does not exist or has been moved.",
        eyebrow: "Error 404",
    },
    es: {
        title: "Página no encontrada",
        description: "Lo sentimos, la página que buscas no existe o ha sido movida.",
        eyebrow: "Error 404",
    },
};

export default function NotFound() {
    const cookieStore = cookies();
    const storedLocale = cookieStore.get("NEXT_LOCALE")?.value as Locale | undefined;
    const locale = storedLocale && i18n.locales.includes(storedLocale) ? storedLocale : i18n.defaultLocale;

    const content = TRANSLATIONS[locale] || TRANSLATIONS[i18n.defaultLocale];

    return (
        <main className="flex min-h-[70vh] items-center justify-center px-4 py-24">
            <div className="relative flex w-full max-w-2xl flex-col items-center gap-8 text-center">
                {/* Background decorative element */}
                <div className="absolute -top-24 -z-10 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl dark:bg-emerald-500/5" aria-hidden="true" />

                <header className="flex flex-col items-center gap-4">
                    <BackHomeButton locale={locale} className="mb-4" />

                    <div className="rounded-3xl border border-slate-200 bg-white/80 p-10 backdrop-blur-md shadow-xl transition-all hover:shadow-2xl dark:border-slate-800 dark:bg-slate-900/40">
                        <p className="text-sm font-bold uppercase tracking-[0.3em] text-emerald-500 mb-2">
                            {content.eyebrow}
                        </p>
                        <h1 className="text-5xl font-extrabold tracking-tight text-slate-900 sm:text-6xl dark:text-white">
                            {content.title}
                        </h1>
                        <p className="mt-6 text-lg leading-8 text-slate-600 dark:text-slate-300">
                            {content.description}
                        </p>

                        <div className="mt-10 flex items-center justify-center gap-x-6">
                            <Link
                                href={locale === i18n.defaultLocale ? "/" : `/${locale}`}
                                className="rounded-full bg-emerald-600 px-8 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 transition-all transform hover:scale-105 active:scale-95"
                            >
                                {locale === 'pt' ? 'Ir para o Início' : locale === 'es' ? 'Ir al Inicio' : 'Go to Home'}
                            </Link>
                        </div>
                    </div>
                </header>

                <div className="mt-8 text-slate-400 dark:text-slate-500">
                    <p className="text-sm italic">
                        {locale === 'pt'
                            ? "Talvez você queira verificar a URL ou voltar para o início."
                            : locale === 'es'
                                ? "Tal vez quieras revisar la URL o volver al inicio."
                                : "Maybe you want to check the URL or go back to home."}
                    </p>
                </div>
            </div>
        </main>
    );
}
