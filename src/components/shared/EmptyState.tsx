import React from "react";
import Link from "next/link";
import { Icon } from "../TiptapEditor/components/ui/Icon";
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon?: string | LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
}

export const EmptyState = ({
  icon,
  title,
  description,
  action,
}: EmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="w-20 h-20 rounded-full bg-gray-50 dark:bg-white/5 flex items-center justify-center mb-6 shadow-sm border border-gray-100 dark:border-white/5">
        {typeof icon === "string" ? (
          <span className="text-4xl">{icon}</span>
        ) : icon ? (
          <Icon
            name={icon as any}
            size={40}
            className="text-gray-300 dark:text-gray-600"
          />
        ) : (
          <span className="text-4xl">📁</span>
        )}
      </div>
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight">
        {title}
      </h3>
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400 max-w-xs leading-relaxed mb-8">
        {description}
      </p>
      {action && (
        <>
          {action.href ? (
            <Link
              href={action.href}
              className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-full shadow-lg shadow-emerald-500/20 transition-all active:scale-95 flex items-center gap-2"
            >
              {action.label}
            </Link>
          ) : (
            <button
              onClick={action.onClick}
              className="px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-full shadow-lg shadow-blue-500/20 transition-all active:scale-95 flex items-center gap-2"
            >
              {action.label}
            </button>
          )}
        </>
      )}
    </div>
  );
};
