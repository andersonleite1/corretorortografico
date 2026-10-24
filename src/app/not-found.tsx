import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#f7f9fc] px-6 text-center">
      <div>
        <p className="text-sm font-bold uppercase tracking-[0.16em] text-blue-700">
          Erro 404
        </p>
        <h1 className="mt-3 text-3xl font-bold">Página não encontrada</h1>
        <p className="mt-3 text-slate-600">
          O endereço pode ter mudado ou não existir.
        </p>
        <Link className="mt-6 inline-block font-semibold text-blue-700" href="/">
          Voltar para a página inicial
        </Link>
      </div>
    </main>
  );
}
