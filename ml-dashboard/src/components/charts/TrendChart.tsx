"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import type { MLTrendKeyword } from "@/types/mercadolibre";

interface Props {
  keywords: MLTrendKeyword[];
  limit?: number;
}

const COLORS = [
  "#facc15", "#fbbf24", "#f59e0b", "#d97706",
  "#a16207", "#fde68a", "#fef08a", "#fef9c3",
];

export default function TrendChart({ keywords, limit = 15 }: Props) {
  const data = keywords.slice(0, limit).map((kw, i) => ({
    name: kw.keyword.length > 18 ? kw.keyword.slice(0, 18) + "…" : kw.keyword,
    fullName: kw.keyword,
    rank: i + 1,
    value: limit - i, // inverted rank as visual weight
    url: kw.url,
  }));

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 0, right: 16, left: 8, bottom: 0 }}
        >
          <XAxis type="number" hide />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fontSize: 11, fill: "#9ca3af" }}
            width={130}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            cursor={{ fill: "rgba(255,255,255,0.03)" }}
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const d = payload[0].payload as (typeof data)[0];
              return (
                <div className="bg-gray-900 border border-white/10 rounded-lg px-3 py-2 text-xs shadow-xl">
                  <p className="font-semibold text-yellow-400">#{d.rank}</p>
                  <p className="text-white mt-0.5">{d.fullName}</p>
                </div>
              );
            }}
          />
          <Bar dataKey="value" radius={[0, 4, 4, 0]}>
            {data.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
                fillOpacity={1 - index * 0.04}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
