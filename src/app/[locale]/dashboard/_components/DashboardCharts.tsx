"use client";

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
import { EmptyState } from "@/components/shared/EmptyState";

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

function formatShortDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

export function TimeSavedChart({
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

export function ToneDistributionChart({
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

export default function DashboardCharts({
  data,
  t,
}: {
  data: { dailySeries: any[]; topTones: any[] };
  t: any;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-[3fr_2fr] gap-4">
      <TimeSavedChart data={data.dailySeries} t={t} />
      <ToneDistributionChart data={data.topTones} t={t} />
    </div>
  );
}
