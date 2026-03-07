"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

type Plan = "free" | "pro" | "team";

interface PlanContextType {
    plan: Plan;
    isLoading: boolean;
}

const PlanContext = createContext<PlanContextType | undefined>(undefined);

export function PlanProvider({ children, initialPlan = "free" }: { children: React.ReactNode, initialPlan?: Plan }) {
    const [plan, setPlan] = useState<Plan>(initialPlan);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Delay fetch by 2 seconds to prioritize initial hydration
        const timer = setTimeout(() => {
            fetch("/api/user/plan")
                .then((res) => res.json())
                .then((data) => {
                    if (data.plan) setPlan(data.plan);
                })
                .catch((err) => console.error("Error fetching user plan:", err))
                .finally(() => setIsLoading(false));
        }, 2000);

        return () => clearTimeout(timer);
    }, []);

    return (
        <PlanContext.Provider value={{ plan, isLoading }}>
            {children}
        </PlanContext.Provider>
    );
}

export function useUserPlan() {
    const context = useContext(PlanContext);
    if (context === undefined) {
        return { plan: "free" as Plan, isLoading: false };
    }
    return context;
}
