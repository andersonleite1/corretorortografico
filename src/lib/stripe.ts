import Stripe from "stripe";

// Singleton para evitar múltiplas instâncias
export const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY || "sk_test_placeholder",
  {
    apiVersion: "2026-02-25.clover", // Updated to a more recent stable version
    typescript: true,
  },
);

// Mapeia Price ID → nome do plano
export const PLAN_BY_PRICE_ID: Record<string, string> = {
  [process.env.STRIPE_PRO_PRICE_ID!]: "pro",
  [process.env.STRIPE_TEAM_PRICE_ID!]: "team",
};
