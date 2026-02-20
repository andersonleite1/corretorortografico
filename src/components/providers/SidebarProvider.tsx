"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type SidebarContextType = {
    isSidebarOpen: boolean;
    setIsSidebarOpen: (open: boolean) => void;
    isDocumentsDialogOpen: boolean;
    setIsDocumentsDialogOpen: (open: boolean) => void;
};

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const SidebarProvider = ({ children }: { children: React.ReactNode }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isDocumentsDialogOpen, setIsDocumentsDialogOpen] = useState(false);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const stored = localStorage.getItem("rte-sidebar-open");
            if (stored === "true") {
                setIsSidebarOpen(true);
            }
        }
    }, []);

    const toggleSidebar = (value: boolean) => {
        setIsSidebarOpen(value);
        localStorage.setItem("rte-sidebar-open", String(value));
    };

    return (
        <SidebarContext.Provider value={{
            isSidebarOpen,
            setIsSidebarOpen: toggleSidebar,
            isDocumentsDialogOpen,
            setIsDocumentsDialogOpen
        }}>
            {children}
        </SidebarContext.Provider>
    );
};

export const useSidebar = () => {
    const context = useContext(SidebarContext);
    if (context === undefined) {
        return {
            isSidebarOpen: false,
            setIsSidebarOpen: () => console.warn("useSidebar used outside SidebarProvider"),
            isDocumentsDialogOpen: false,
            setIsDocumentsDialogOpen: () => console.warn("useSidebar used outside SidebarProvider")
        };
    }
    return context;
};
