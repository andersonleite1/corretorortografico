"use client";

import { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import Link from "next/link";
import { EmptyState } from "@/components/shared/EmptyState";
import { getCommonMessages } from "@/data/common";
import { type Locale } from "../../../../i18n-config";

// ── Types ──────────────────────────────────────────────────────────────────────
interface DashboardData {
  totalDocuments: number;
  plan: string;
  totalTimeSavedSeconds: number;
  topTones: { tone: string; count: number }[];
  recentDocuments: { id: string; title: string; updatedAt: string }[];
  dailySeries: { date: string; timeSavedMinutes: number; rewrites: number }[];
  usedDaily: number;
  limitDaily: number;
  usedMonthlyPaid: number;
  limitMonthlyPaid: number;
}

// ── Constants ──────────────────────────────────────────────────────────────────
const TONE_LABELS: Record<string, string> = {
  professional: "Profissional",
  casual: "Casual",
  concise: "Conciso",
  expanded: "Expandido",
  creative: "Criativo",
  prompt: "Prompt IA",
  formal: "Formal",
  academic: "Acadêmico",
  simplified: "Simplificado",
  romantic: "Romântico",
  narrative: "Narrativa",
  instagram: "Instagram",
  whatsapp: "WhatsApp",
  tweet: "Tweet",
  persuasive: "Persuasivo",
  friendly: "Amigável",
};

const CHART_COLORS = ["#059669", "#6366f1", "#f59e0b", "#ef4444", "#8b5cf6"];

// ── Helpers ────────────────────────────────────────────────────────────────────
function formatTimeSaved(totalSeconds: number): string {
  if (totalSeconds < 60) return `${totalSeconds}s`;
  const minutes = Math.floor(totalSeconds / 60);
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (remainingMinutes === 0) return `${hours}h`;
  return `${hours}h ${remainingMinutes}min`;
}

function formatShortDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "Agora mesmo";
  if (diffMins < 60) return `Há ${diffMins} min`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `Há ${diffHours}h`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "Ontem";
  if (diffDays < 30) return `Há ${diffDays} dias`;
  return date.toLocaleDateString("pt-BR");
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function KpiCard({
  label,
  value,
  sublabel,
  accentClass,
  icon,
}: {
  label: string;
  value: string;
  sublabel?: string;
  accentClass: string;
  icon: string;
}) {
  return (
    <div className="rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-6 transition-shadow hover:shadow-md dark:hover:shadow-lg">
      <div className="flex items-center gap-3 mb-4">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0 ${accentClass}`}
        >
          {icon}
        </div>
        <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
          {label}
        </p>
      </div>
      <p className="text-4xl font-bold tracking-tight text-neutral-900 dark:text-white leading-none">
        {value}
      </p>
      {sublabel && (
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2">
          {sublabel}
        </p>
      )}
    </div>
  );
}

function AiQuotaRing({
  title,
  subtitle,
  used,
  limit,
  plan,
}: {
  title: string;
  subtitle: string;
  used: number;
  limit: number;
  plan: string;
}) {
  const percentage = limit > 0 ? Math.min((used / limit) * 100, 100) : 0;
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;
  const strokeColor =
    percentage >= 90 ? "#ef4444" : percentage >= 70 ? "#f59e0b" : "#059669";

  return (
    <div className="rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-6 flex items-center gap-6">
      <div className="relative flex-shrink-0">
        <svg width="128" height="128" viewBox="0 0 128 128">
          <circle
            cx="64"
            cy="64"
            r={radius}
            fill="none"
            stroke="currentColor"
            className="text-neutral-100 dark:text-neutral-800"
            strokeWidth="10"
          />
          <circle
            cx="64"
            cy="64"
            r={radius}
            fill="none"
            stroke={strokeColor}
            strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{
              transition: "stroke-dashoffset 1s ease",
              transformOrigin: "64px 64px",
              transform: "rotate(-90deg)",
            }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-bold text-neutral-900 dark:text-white leading-none">
            {used}
          </span>
          <span className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            de {limit}
          </span>
        </div>
      </div>
      <div>
        <p className="text-xs font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest mb-1">
          {title}
        </p>
        <p className="text-2xl font-bold text-neutral-900 dark:text-white leading-none">
          {Math.round(percentage)}%
        </p>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1.5">
          {subtitle}
        </p>
        <span className="inline-block mt-2.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-semibold capitalize">
          Plano {plan}
        </span>
      </div>
    </div>
  );
}

function TimeSavedChart({
  data,
  t,
}: {
  data: { date: string; timeSavedMinutes: number; rewrites: number }[];
  t: any;
}) {
  const formatted = data.map((d) => ({ ...d, label: formatShortDate(d.date) }));
  const hasData = data.some((d) => d.timeSavedMinutes > 0);

  return (
    <div className="rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-6">
      <p className="text-xs font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest">
        {t.productivityEvol}
      </p>
      <p className="text-lg font-semibold text-neutral-900 dark:text-white mt-1">
        {t.timeSaved30}
      </p>

      {!hasData ? (
        <EmptyState icon="📈" title={t.noData} description={t.noRewrites} />
      ) : (
        <div className="mt-4">
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart
              data={formatted}
              margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="tsgGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#059669" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
              <XAxis
                dataKey="label"
                tick={{ fill: "#6b7280", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                interval={4}
              />
              <YAxis
                tick={{ fill: "#6b7280", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${v}m`}
              />
              <Tooltip
                contentStyle={{
                  background: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "10px",
                  color: "#111827",
                  fontSize: "12px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                }}
                formatter={(value: any) => [`${value ?? 0} min`, t.timeSaved]}
                cursor={{ stroke: "rgba(0,0,0,0.08)" }}
              />
              <Area
                type="monotone"
                dataKey="timeSavedMinutes"
                stroke="#059669"
                strokeWidth={2}
                fill="url(#tsgGradient)"
                dot={false}
                activeDot={{
                  r: 4,
                  fill: "#059669",
                  stroke: "#fff",
                  strokeWidth: 2,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

function ToneDistributionChart({
  data,
  t,
}: {
  data: { tone: string; count: number }[];
  t: any;
}) {
  const groupedTones: Record<string, number> = {};
  data.forEach((d) => {
    const key = d.tone.startsWith("custom-") ? "custom-group" : d.tone;
    groupedTones[key] = (groupedTones[key] || 0) + d.count;
  });

  const formatted = Object.entries(groupedTones).map(([tone, count]) => ({
    name:
      tone === "custom-group" ? "Personalizado" : (TONE_LABELS[tone] ?? tone),
    value: count,
  }));

  return (
    <div className="rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-6">
      <p className="text-xs font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest">
        {t.preferences}
      </p>
      <p className="text-lg font-semibold text-neutral-900 dark:text-white mt-1">
        {t.topTones}
      </p>

      {formatted.length === 0 ? (
        <EmptyState icon="🎨" title={t.noTones} description={t.noTonesDesc} />
      ) : (
        <div className="mt-4">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={formatted}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={3}
                dataKey="value"
              >
                {formatted.map((_, index) => (
                  <Cell
                    key={index}
                    fill={CHART_COLORS[index % CHART_COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "10px",
                  color: "#111827",
                  fontSize: "12px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                }}
                formatter={(value: any, name: any) => [value ?? 0, name ?? ""]}
              />
              <Legend
                iconType="circle"
                iconSize={8}
                formatter={(val) => (
                  <span className="text-xs text-neutral-500 dark:text-neutral-400">
                    {val}
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

function RecentDocuments({
  documents,
  t,
}: {
  documents: { id: string; title: string; updatedAt: string }[];
  t: any;
}) {
  return (
    <div className="rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-xs font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest">
            {t.quickAccess}
          </p>
          <p className="text-lg font-semibold text-neutral-900 dark:text-white mt-1">
            {t.recentDocs}
          </p>
        </div>
        <Link
          href="/"
          className="text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
        >
          {t.seeAll} →
        </Link>
      </div>

      {documents.length === 0 ? (
        <EmptyState
          icon="📄"
          title={t.startGreat}
          description={t.recentDocsDesc}
          action={{
            label: t.newDocument,
            href: "/",
          }}
        />
      ) : (
        <div className="flex flex-col gap-2">
          {documents.map((doc) => (
            <Link
              key={doc.id}
              href={`/?doc=${doc.id}`}
              className="flex items-center justify-between px-4 py-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 border border-transparent hover:border-emerald-200 dark:hover:border-emerald-800 transition-all group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-base flex-shrink-0">📄</span>
                <span className="text-sm font-medium text-neutral-800 dark:text-neutral-200 truncate">
                  {doc.title || t.untitled}
                </span>
              </div>
              <span className="text-xs text-neutral-400 dark:text-neutral-500 flex-shrink-0 ml-3">
                {timeAgo(doc.updatedAt)}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

import DashboardSkeleton from "@/components/dashboard/DashboardSkeleton";
import { useEditorSettings } from "@/components/providers/EditorSettingsProvider";

// ── Main Component ─────────────────────────────────────────────────────────────

export default function DashboardContent({
  userName,
  locale,
}: {
  userName: string;
  locale: Locale;
}) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { setIsSettingsDialogOpen } = useEditorSettings();
  const t = getCommonMessages(locale).dashboard;

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then(setData)
      .catch(() =>
        setError("Erro ao carregar métricas. Por favor, tente novamente."),
      )
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 font-sans">
      {/* Page Header */}
      <div className="border-b border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-6 md:px-10 py-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">
              {t.welcomeBack} 👋
            </p>
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
              {userName}
            </h1>
          </div>
          <div className="flex gap-3 flex-wrap">
            <Link
              href="/"
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white text-sm font-semibold transition-colors"
            >
              ✏️ {t.newDocument}
            </Link>
            <button
              onClick={() => setIsSettingsDialogOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 text-sm font-medium transition-colors"
            >
              ⚙️ {t.settings}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 md:px-10 py-10 pb-20">
        {loading && <DashboardSkeleton showPageHeader={false} />}

        {error && (
          <div className="p-5 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-center text-sm">
            {error}
          </div>
        )}

        {data && !loading && (
          <div className="flex flex-col gap-5">
            {/* KPI Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <KpiCard
                label={t.timeSaved}
                value={formatTimeSaved(data.totalTimeSavedSeconds)}
                sublabel={t.timeSavedTotal}
                accentClass="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
                icon="⏱️"
              />
              <KpiCard
                label={t.documents}
                value={String(data.totalDocuments)}
                sublabel={t.docsSavedCloud}
                accentClass="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
                icon="📁"
              />
              <KpiCard
                label={t.rewritesToday}
                value={String(data.usedDaily)}
                sublabel={`de ${data.limitDaily} ${t.freeLimit} ${data.plan})`}
                accentClass="bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400"
                icon="✨"
              />
            </div>

            {/* Quota Ring */}
            <div
              className={`grid grid-cols-1 ${data.plan !== "free" ? "md:grid-cols-2" : ""} gap-4`}
            >
              <AiQuotaRing
                title={t.freeDailyQuota}
                subtitle={t.usedToday}
                used={data.usedDaily}
                limit={data.limitDaily}
                plan={data.plan}
              />
              {data.plan !== "free" && (
                <AiQuotaRing
                  title={t.planMonthlyQuota}
                  subtitle={t.usedMonth}
                  used={data.usedMonthlyPaid}
                  limit={data.limitMonthlyPaid}
                  plan={data.plan}
                />
              )}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 md:grid-cols-[3fr_2fr] gap-4">
              <TimeSavedChart data={data.dailySeries} t={t} />
              <ToneDistributionChart data={data.topTones} t={t} />
            </div>

            {/* Recent Documents */}
            <RecentDocuments documents={data.recentDocuments} t={t} />

            {/* Upgrade CTA — free plan only */}
            {data.plan === "free" && (
              <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-50 to-indigo-50 dark:from-emerald-900/20 dark:to-indigo-900/20 border border-emerald-200 dark:border-emerald-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-widest">
                    ⚡ {t.freePlan}
                  </p>
                  <p className="text-lg font-semibold text-neutral-900 dark:text-white mt-1">
                    {t.unlockPro}
                  </p>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                    {t.unlimitedDocs}
                  </p>
                </div>
                <Link
                  href="#pricing"
                  className="px-7 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold transition-colors whitespace-nowrap flex-shrink-0"
                >
                  {t.seePlans} →
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
