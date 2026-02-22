"use client";

import React, { useEffect } from "react";

interface SaveNotificationProps {
    message: string;
    onClose: () => void;
    type?: "success" | "error" | "info";
}

export const SaveNotification = ({ message, onClose, type = "success" }: SaveNotificationProps) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    const colors = {
        success: {
            border: "border-green-500/30",
            dot: "bg-green-500",
            ping: "bg-green-400",
            text: "text-green-600 dark:text-green-400"
        },
        error: {
            border: "border-red-500/30",
            dot: "bg-red-500",
            ping: "bg-red-400",
            text: "text-red-600 dark:text-red-400"
        },
        info: {
            border: "border-blue-500/30",
            dot: "bg-blue-500",
            ping: "bg-blue-400",
            text: "text-blue-600 dark:text-blue-400"
        }
    };

    const config = colors[type];

    return (
        <div className="fixed top-24 right-6 z-[101] animate-in fade-in slide-in-from-top-4 duration-500 ease-out">
            <div className={`bg-white/60 dark:bg-[#1c1c1e]/60 backdrop-blur-xl px-5 py-2.5 rounded-full border ${config.border} shadow-[0_8px_32px_rgba(0,0,0,0.1)] flex items-center gap-3`}>
                <div className="relative flex h-2 w-2">
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${config.ping} opacity-75`}></span>
                    <span className={`relative inline-flex rounded-full h-2 w-2 ${config.dot}`}></span>
                </div>
                <span className={`text-[13px] font-medium ${config.text} tracking-tight`}>
                    {message}
                </span>
            </div>
        </div>
    );
};

export default SaveNotification;
