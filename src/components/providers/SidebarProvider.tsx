"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type SidebarContextType = {
    isSidebarOpen: boolean;
    setIsSidebarOpen: (open: boolean) => void;
    isLTSidebarOpen: boolean;
    setIsLTSidebarOpen: (open: boolean) => void;
    isDocumentsDialogOpen: boolean;
    setIsDocumentsDialogOpen: (open: boolean) => void;
    isMobile: boolean;
};

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const SidebarProvider = ({ children }: { children: React.ReactNode }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isLTSidebarOpen, setIsLTSidebarOpen] = useState(false);
    const [isDocumentsDialogOpen, setIsDocumentsDialogOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            const mobile = window.innerWidth < 1024;
            setIsMobile(mobile);
            if (mobile) {
                setIsSidebarOpen(false);
                setIsLTSidebarOpen(false);
            }
        };

        checkMobile();
        window.addEventListener("resize", checkMobile);

        if (typeof window !== "undefined") {
            const stored = localStorage.getItem("rte-sidebar-open");
            if (stored === "true" && window.innerWidth >= 1024) {
                setIsSidebarOpen(true);
            }
            const storedLT = localStorage.getItem("rte-lt-sidebar-open");
            if (storedLT === "true" && window.innerWidth >= 1024) {
                setIsLTSidebarOpen(true);
            } else if (storedLT === null && window.innerWidth >= 1024) {
                // Open by default for new users on desktop
                setIsLTSidebarOpen(true);
            }
        }

        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    const toggleSidebar = (value: boolean) => {
        if (isMobile && value) return; // Prevent opening on mobile
        setIsSidebarOpen(value);
        localStorage.setItem("rte-sidebar-open", String(value));
    };

    const toggleLTSidebar = (value: boolean) => {
        if (isMobile && value) return; // Prevent opening on mobile
        setIsLTSidebarOpen(value);
        localStorage.setItem("rte-lt-sidebar-open", String(value));
    };

    return (
        <SidebarContext.Provider value={{
            isSidebarOpen,
            setIsSidebarOpen: toggleSidebar,
            isLTSidebarOpen,
            setIsLTSidebarOpen: toggleLTSidebar,
            isDocumentsDialogOpen,
            setIsDocumentsDialogOpen,
            isMobile // Export isMobile to help components decide to hide themselves
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
            isLTSidebarOpen: false,
            setIsLTSidebarOpen: () => console.warn("useSidebar used outside SidebarProvider"),
            isDocumentsDialogOpen: false,
            setIsDocumentsDialogOpen: () => console.warn("useSidebar used outside SidebarProvider"),
            isMobile: false
        };
    }
    return context;
};
