"use client";

import React, { useEffect } from "react";

interface SaveNotificationProps {
    message: string;
    onClose: () => void;
}

export const SaveNotification = ({ message, onClose }: SaveNotificationProps) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className="fixed top-24 right-6 z-[101] animate-in fade-in slide-in-from-top-4 duration-500 ease-out">
            <div className="bg-white/60 dark:bg-[#1c1c1e]/60 backdrop-blur-xl px-5 py-2.5 rounded-full border border-green-500/30 shadow-[0_8px_32px_rgba(0,0,0,0.1)] flex items-center gap-3">
                <div className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </div>
                <span className="text-[13px] font-medium text-green-600 dark:text-green-400 tracking-tight">
                    {message}
                </span>
            </div>
        </div>
    );
};

export default SaveNotification;
