import type { ReactNode } from "react";
import Link from "next/link";

interface SiteInfoPageProps {
  title: string;
  description: string;
  children: ReactNode;
}

export default function SiteInfoPage({
  title,
  description,
  children,
}: SiteInfoPageProps) {
  return (
    <div className="min-h-screen bg-[#f7f9fc] text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-3 px-5 py-4 sm:px-6">
          <Link href="/" className="text-lg font-bold tracking-tight">
            <span className="text-blue-700">Corretor</span>Ortografico.online
          </Link>
          <nav aria-label="Navegação principal" className="flex gap-5 text-sm">
            <Link href="/sobre" className="text-slate-600 hover:text-blue-700">
              Sobre
            </Link>
            <Link
              href="/privacidade"
              className="text-slate-600 hover:text-blue-700"
            >
              Privacidade
            </Link>
          </nav>
        </div>
      </header>

      <main className="px-5 py-12 sm:px-6 sm:py-16">
        <article className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {title}
          </h1>
          <p className="mt-4 text-lg leading-8 text-slate-600">
            {description}
          </p>
          <div className="mt-10 space-y-9 leading-7 text-slate-700">
            {children}
          </div>
        </article>
      </main>

      <footer className="border-t border-slate-200 bg-white px-5 py-7 sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} CorretorOrtografico.online</p>
          <nav aria-label="Informações do site" className="flex gap-5">
            <Link href="/sobre" className="hover:text-blue-700">
              Sobre
            </Link>
            <Link href="/privacidade" className="hover:text-blue-700">
              Privacidade
            </Link>
            <a
              href="mailto:contato@corretorortografico.online"
              className="hover:text-blue-700"
            >
              Contato
            </a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
