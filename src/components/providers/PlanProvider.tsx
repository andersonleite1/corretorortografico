"use client";

import { createContext, useContext, type ReactNode } from "react";
export type Plan = "free" | "pro" | "team";
const PlanContext = createContext({ plan: "free" as Plan, isLoading: false });
export function PlanProvider({ children }: { children: ReactNode }) {
  return (
    <PlanContext.Provider value={{ plan: "free", isLoading: false }}>
      {children}
    </PlanContext.Provider>
  );
}
export function useUserPlan() {
  return useContext(PlanContext);
}
