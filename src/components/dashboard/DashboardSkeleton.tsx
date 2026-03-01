"use client";

import React from "react";

function SkeletonCard({ height = "h-36" }: { height?: string }) {
    return (
        <div
            className={`rounded-2xl bg-neutral-100 dark:bg-neutral-800 animate-pulse ${height}`}
        />
    );
}

export default function DashboardSkeleton({
    showPageHeader = true,
}: {
    showPageHeader?: boolean;
}) {
    return (
        <div
            className={
                showPageHeader
                    ? "min-h-screen bg-neutral-50 dark:bg-neutral-950 font-sans"
                    : ""
            }
        >
            {/* Page Header Skeleton */}
            {showPageHeader && (
                <div className="border-b border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-6 md:px-10 py-8">
                    <div className="max-w-6xl mx-auto flex items-center justify-between flex-wrap gap-4">
                        <div className="space-y-2">
                            <div className="w-32 h-4 bg-neutral-100 dark:bg-neutral-800 animate-pulse rounded-md" />
                            <div className="w-48 h-8 bg-neutral-100 dark:bg-neutral-800 animate-pulse rounded-md" />
                        </div>
                        <div className="flex gap-3 flex-wrap">
                            <div className="w-36 h-10 bg-neutral-100 dark:bg-neutral-800 animate-pulse rounded-xl" />
                            <div className="w-36 h-10 bg-neutral-100 dark:bg-neutral-800 animate-pulse rounded-xl" />
                        </div>
                    </div>
                </div>
            )}

            {/* Content Skeleton */}
            <div className="max-w-6xl mx-auto px-6 md:px-10 py-10 pb-20">
                <div className="flex flex-col gap-5">
                    {/* KPI Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <SkeletonCard />
                        <SkeletonCard />
                        <SkeletonCard />
                    </div>
                    {/* Quota Ring area */}
                    <SkeletonCard height="h-40" />
                    {/* Charts area */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <SkeletonCard height="h-72" />
                        <SkeletonCard height="h-72" />
                    </div>
                    {/* Recent Documents area */}
                    <SkeletonCard height="h-52" />
                </div>
            </div>
        </div>
    );
}
