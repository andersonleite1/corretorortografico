import { getUserPlan } from "@/lib/auth";
import { redirect } from "next/navigation";

const plans = [
    {
        name: "Free",
        price: "$0",
        period: "para sempre",
        description: "Editor completo, sem login. Seus dados ficam no seu dispositivo.",
        features: ["Editor WYSIWYG completo", "Exportação PDF/TXT/DOCX", "Modo Fonte (HTML)", "10 rascunhos locais", "5 usos de IA por dia"],
        cta: "Usar gratuitamente",
        priceId: null,
        highlighted: false,
    },
    {
        name: "Pro",
        price: "$12",
        period: "por mês",
        description: "Para criadores de conteúdo sérios que precisam de IA e Cloud.",
        features: ["Tudo do Free", "IA Ilimitada (Reescrita, Tradução, SEO)", "Transcrição de áudio", "Sync em nuvem (Cross-device)", "Histórico de versões", "Suporte prioritário"],
        cta: "Começar Pro",
        priceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID,
        highlighted: true,
    },
    {
        name: "Team Business",
        price: "$25",
        period: "por mês",
        description: "Ideal para equipes pequenas que colaboram em projetos de conteúdo.",
        features: ["Tudo do Pro", "Até 5 usuários", "Espaço de trabalho compartilhado", "Gerenciamento de equipe", "Faturamento centralizado", "Treinamento dedicado"],
        cta: "Em breve",
        priceId: "coming-soon",
        highlighted: false,
    },
];

export default async function PricingPage() {
    const currentPlan = await getUserPlan();

    return (
        <div className="min-h-screen py-20 px-4">
            <div className="max-w-6xl mx-auto text-center">
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                    Planos e Preços
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-400 mb-16 max-w-2xl mx-auto">
                    Comece grátis. Faça upgrade quando precisar de mais poder.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-start">
                    {plans.map((plan) => (
                        <div
                            key={plan.name}
                            className={`rounded-[2.5rem] p-8 border flex flex-col transition-all duration-300 hover:shadow-xl ${plan.highlighted
                                ? "border-indigo-500 bg-white/90 dark:bg-gray-800/90 shadow-lg scale-105 z-10 relative"
                                : "border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 backdrop-blur-sm"
                                }`}
                        >
                            {plan.highlighted && (
                                <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-500 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-md tracking-wider uppercase">
                                    Mais Popular
                                </span>
                            )}

                            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                                {plan.name}
                            </h2>

                            <div className="mt-4 mb-6">
                                <span className="text-5xl font-black text-gray-900 dark:text-gray-100">
                                    {plan.price}
                                </span>
                                <span className="text-gray-500 dark:text-gray-400 ml-1 text-lg">
                                    /{plan.period}
                                </span>
                            </div>

                            <p className="text-gray-600 dark:text-gray-400 text-sm mb-8 leading-relaxed">
                                {plan.description}
                            </p>

                            <ul className="space-y-4 mb-10 flex-grow">
                                {plan.features.map((f) => (
                                    <li key={f} className="flex items-start gap-3 text-sm text-gray-700 dark:text-gray-300">
                                        <div className="mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400">
                                            ✓
                                        </div>
                                        <span className="text-left">{f}</span>
                                    </li>
                                ))}
                            </ul>

                            {plan.priceId === "coming-soon" ? (
                                <div className="block w-full py-4 rounded-2xl font-bold text-sm bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 text-center cursor-not-allowed border border-gray-200 dark:border-gray-700">
                                    {plan.cta}
                                </div>
                            ) : plan.priceId ? (
                                <CheckoutButton
                                    priceId={plan.priceId}
                                    currentPlan={currentPlan}
                                    cta={plan.cta}
                                />
                            ) : (
                                <a
                                    href="/"
                                    className="block w-full py-4 rounded-2xl font-bold text-sm bg-slate-900 hover:bg-black dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 text-center transition-colors shadow-lg"
                                >
                                    {plan.cta}
                                </a>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// Client Component for the button to handle the fetch
import { CheckoutButton } from "./CheckoutButton";
