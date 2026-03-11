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
  Cell,
} from "recharts";
import { TimeEntry } from "../types";
import { groupBy, uniqueValues, msToHours } from "../utils";
import { colorFor } from "../colors";

interface Props {
  entries: TimeEntry[];
}

export default function HoursByClient({ entries }: Props) {
  const allUsers = uniqueValues(entries.map((e) => e.user.username)).sort();
  const [filterUser, setFilterUser] = useState<string>("all");
  const [mode, setMode] = useState<"absolute" | "percent">("absolute");

  const filtered =
    filterUser === "all"
      ? entries
      : entries.filter((e) => e.user.username === filterUser);

  const byClient = groupBy(filtered, (e) => e.client);

  // Sort clients by total hours desc
  const clients = Object.keys(byClient).sort((a, b) => {
    const ta = byClient[a].reduce((s, e) => s + e.duration, 0);
    const tb = byClient[b].reduce((s, e) => s + e.duration, 0);
    return tb - ta;
  });

  const data = clients.map((client) => {
    const clientEntries = byClient[client];
    const total = clientEntries.reduce((s, e) => s + e.duration, 0);
    const byUser = groupBy(clientEntries, (e) => e.user.username);

    const row: Record<string, string | number> = { client };
    for (const user of allUsers) {
      const userMs = (byUser[user] ?? []).reduce((s, e) => s + e.duration, 0);
      const hrs = msToHours(userMs);
      if (mode === "absolute") {
        row[user] = parseFloat(hrs.toFixed(2));
      } else {
        row[user] = total > 0 ? parseFloat(((userMs / total) * 100).toFixed(1)) : 0;
      }
    }
    return row;
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <h2 className="text-base font-semibold">Hours by Client</h2>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-xs" style={{ color: "#6b7280" }}>
              Person:
            </span>
            <select
              value={filterUser}
              onChange={(e) => setFilterUser(e.target.value)}
              className="text-xs px-2 py-1.5 rounded"
              style={{
                background: "#1a1a1a",
                border: "1px solid #333",
                color: "#e5e7eb",
              }}
            >
              <option value="all">All</option>
              {allUsers.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>

          <div className="flex rounded overflow-hidden" style={{ border: "1px solid #333" }}>
            {(["absolute", "percent"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className="px-3 py-1.5 text-xs transition-colors"
                style={{
                  background: mode === m ? "#6366f1" : "#131313",
                  color: mode === m ? "#fff" : "#9ca3af",
                  borderRight: m === "absolute" ? "1px solid #333" : undefined,
                }}
              >
                {m === "absolute" ? "Hours" : "% of Client"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {data.length === 0 ? (
        <p className="text-sm" style={{ color: "#6b7280" }}>
          No data for selected range.
        </p>
      ) : (
        <ResponsiveContainer width="100%" height={Math.max(300, data.length * 44)}>
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 8, right: 48, left: 8, bottom: 8 }}
          >
            <XAxis
              type="number"
              tick={{ fill: "#9ca3af", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => (mode === "absolute" ? `${v}h` : `${v}%`)}
            />
            <YAxis
              type="category"
              dataKey="client"
              width={140}
              tick={{ fill: "#9ca3af", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                background: "#1a1a1a",
                border: "1px solid #333",
                borderRadius: 6,
              }}
              labelStyle={{ color: "#e5e7eb", marginBottom: 4 }}
              itemStyle={{ color: "#d1d5db" }}
              formatter={(v: unknown) => {
                const n = v as number;
                return mode === "absolute" ? [`${n.toFixed(1)}h`] : [`${n.toFixed(1)}%`];
              }}
            />
            <Legend
              wrapperStyle={{ color: "#9ca3af", fontSize: 12, paddingTop: 8 }}
            />
            {allUsers.map((user) => (
              <Bar key={user} dataKey={user} stackId="a" fill={colorFor(user)} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
