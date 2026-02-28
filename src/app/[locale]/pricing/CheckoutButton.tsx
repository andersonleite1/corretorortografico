"use client";

import { useState } from "react";
import { toast } from "sonner";

interface CheckoutButtonProps {
  priceId: string;
  currentPlan: string;
  cta: string;
}

export function CheckoutButton({
  priceId,
  currentPlan,
  cta,
}: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handleCheckout() {
    try {
      setLoading(true);
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId }),
      });

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error(data.error || "Erro ao iniciar checkout.");
      }
    } catch (error) {
      toast.error("Erro ao processar checkout.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  const isCurrentPlan = currentPlan === "pro" || currentPlan === "team";

  return (
    <button
      onClick={handleCheckout}
      disabled={isCurrentPlan || loading}
      className={`w-full py-3 rounded-xl font-semibold text-sm transition ${
        isCurrentPlan
          ? "bg-gray-700 text-gray-400 cursor-not-allowed"
          : "bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50"
      }`}
    >
      {loading ? "Carregando..." : isCurrentPlan ? "✓ Plano Atual" : cta}
    </button>
  );
}
