"use client";

import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { TimeEntry } from "../types";
import { groupBy, uniqueValues, msToHours, weekCommencing } from "../utils";
import { colorFor } from "../colors";

interface Props {
  entries: TimeEntry[];
}

export default function WeeklyTrends({ entries }: Props) {
  const allUsers = uniqueValues(entries.map((e) => e.user.username)).sort();
  const [selectedUser, setSelectedUser] = useState<string>("all");

  const filtered =
    selectedUser === "all"
      ? entries
      : entries.filter((e) => e.user.username === selectedUser);

  const allRoles = uniqueValues(filtered.map((e) => e.deliveryRole)).sort();

  // Build week buckets
  const byWeek = groupBy(filtered, (e) => weekCommencing(e.start));
  const weeks = Object.keys(byWeek).sort();

  const data = weeks.map((week) => {
    const weekEntries = byWeek[week];
    const byRole = groupBy(weekEntries, (e) => e.deliveryRole);
    const row: Record<string, string | number> = { week };
    for (const role of allRoles) {
      row[role] = parseFloat(
        msToHours(
          (byRole[role] ?? []).reduce((s, e) => s + e.duration, 0)
        ).toFixed(2)
      );
    }
    return row;
  });

  // Week-on-week % change for the last bar total
  let wowAnnotation: string | null = null;
  if (data.length >= 2) {
    const last = data[data.length - 1];
    const prev = data[data.length - 2];
    const lastTotal = allRoles.reduce((s, r) => s + (last[r] as number), 0);
    const prevTotal = allRoles.reduce((s, r) => s + (prev[r] as number), 0);
    if (prevTotal > 0) {
      const pct = ((lastTotal - prevTotal) / prevTotal) * 100;
      wowAnnotation = `${pct >= 0 ? "+" : ""}${pct.toFixed(0)}% vs prev week`;
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <h2 className="text-base font-semibold">Week-on-Week Trends</h2>
        <div className="flex items-center gap-2">
          <span className="text-xs" style={{ color: "#6b7280" }}>
            View:
          </span>
          <select
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            className="text-xs px-2 py-1.5 rounded"
            style={{
              background: "#1a1a1a",
              border: "1px solid #333",
              color: "#e5e7eb",
            }}
          >
            <option value="all">All team</option>
            {allUsers.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
        </div>
      </div>

      {wowAnnotation && (
        <div
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs mb-4"
          style={{ background: "#1a1a1a", border: "1px solid #333", color: "#9ca3af" }}
        >
          <span className="text-indigo-400">●</span>
          Latest week: {wowAnnotation}
        </div>
      )}

      {data.length === 0 ? (
        <p className="text-sm" style={{ color: "#6b7280" }}>
          No data for selected range.
        </p>
      ) : (
        <ResponsiveContainer width="100%" height={420}>
          <BarChart data={data} margin={{ top: 8, right: 24, left: 0, bottom: 24 }}>
            <XAxis
              dataKey="week"
              tick={{ fill: "#9ca3af", fontSize: 11 }}
              axisLine={{ stroke: "#333" }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "#9ca3af", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${v}h`}
            />
            <Tooltip
              contentStyle={{
                background: "#1a1a1a",
                border: "1px solid #333",
                borderRadius: 6,
              }}
              labelStyle={{ color: "#e5e7eb", marginBottom: 4 }}
              itemStyle={{ color: "#d1d5db" }}
              formatter={(v: unknown) => [`${(v as number).toFixed(1)}h`]}
            />
            <Legend
              wrapperStyle={{ color: "#9ca3af", fontSize: 12, paddingTop: 12 }}
            />
            {allRoles.map((role) => (
              <Bar key={role} dataKey={role} stackId="a" fill={colorFor(role)} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
