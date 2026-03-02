"use client";

import { useState } from "react";
import { toast } from "sonner";
import { User } from "@/types/user";
import { useParams } from "next/navigation";
import { getCommonMessages } from "@/data/common";
import { type Locale } from "../../../../i18n-config";

export function SettingsContent({ user, plan }: { user: User; plan: string }) {
  const params = useParams();
  const t = getCommonMessages(params?.locale as Locale).settings;
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("subscription");

  async function handleManageSubscription() {
    try {
      setLoading(true);
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error(data.error || t.errorProcess);
      }
    } catch (error) {
      toast.error(t.errorProcess);
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col md:flex-row min-h-[500px]">
      {/* Sidebar */}
      <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-gray-800 p-4 space-y-2">
        <button
          onClick={() => setActiveTab("profile")}
          className={`w-full flex items-center gap-3 px-4 py-2 rounded-xl text-sm font-medium transition ${
            activeTab === "profile"
              ? "bg-indigo-600 text-white"
              : "text-gray-400 hover:bg-gray-800 hover:text-white"
          }`}
        >
          Perfil
        </button>
        <button
          onClick={() => setActiveTab("subscription")}
          className={`w-full flex items-center gap-3 px-4 py-2 rounded-xl text-sm font-medium transition ${
            activeTab === "subscription"
              ? "bg-indigo-600 text-white"
              : "text-gray-400 hover:bg-gray-800 hover:text-white"
          }`}
        >
          Assinatura
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 p-8">
        {activeTab === "profile" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white mb-1">{t.profile}</h2>
              <p className="text-sm text-gray-400">
                Gerencie suas informações básicas.
              </p>
            </div>

            <div className="space-y-4">
              <div className="grid gap-2">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Nome
                </label>
                <div className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white">
                  {user.name || "Não informado"}
                </div>
              </div>
              <div className="grid gap-2">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Email
                </label>
                <div className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white">
                  {user.email}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "subscription" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white mb-1">
                Plano e Pagamento
              </h2>
              <p className="text-sm text-gray-400">
                Gerencie sua assinatura e faturamento.
              </p>
            </div>

            <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center text-indigo-400">
                  ⚡
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-white capitalize">{plan}</h3>
                    {plan !== "free" && (
                      <span className="bg-green-500/10 text-green-400 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                        Ativo
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400">
                    {plan === "free"
                      ? "Você está no plano gratuito."
                      : `Sua assinatura ${plan} está ativa.`}
                  </p>
                </div>
              </div>

              {plan === "free" ? (
                <a
                  href="#pricing"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition text-center"
                >
                  Fazer Upgrade
                </a>
              ) : (
                <button
                  onClick={handleManageSubscription}
                  disabled={loading}
                  className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition disabled:opacity-50"
                >
                  {loading ? "Carregando..." : "Gerenciar Assinatura"}
                </button>
              )}
            </div>

            {user.subscription && (
              <div className="text-xs text-gray-500">
                Próxima renovação em:{" "}
                {user.subscription.stripeCurrentPeriodEnd
                  ? new Date(
                      user.subscription.stripeCurrentPeriodEnd as any,
                    ).toLocaleDateString()
                  : "N/A"}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
