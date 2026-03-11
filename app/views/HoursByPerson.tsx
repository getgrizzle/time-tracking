"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList,
} from "recharts";
import { TimeEntry } from "../types";
import { groupBy, sumDuration, uniqueValues, msToHours } from "../utils";
import { colorFor } from "../colors";

interface Props {
  entries: TimeEntry[];
}

export default function HoursByPerson({ entries }: Props) {
  const byUser = groupBy(entries, (e) => e.user.username);
  const allRoles = uniqueValues(entries.map((e) => e.deliveryRole)).sort();

  const data = Object.entries(byUser).map(([user, userEntries]) => {
    const row: Record<string, string | number> = { user };
    const byRole = groupBy(userEntries, (e) => e.deliveryRole);
    let total = 0;
    for (const role of allRoles) {
      const hrs = msToHours(sumDuration(byRole[role] ?? []));
      row[role] = parseFloat(hrs.toFixed(2));
      total += hrs;
    }
    row._total = parseFloat(total.toFixed(1));
    return row;
  });

  data.sort((a, b) => (b._total as number) - (a._total as number));

  const CustomLabel = (props: { x?: number; y?: number; width?: number; value?: number; index?: number }) => {
    const { x = 0, y = 0, width = 0, index = 0 } = props;
    const total = data[index]?._total;
    if (total === undefined) return null;
    return (
      <text
        x={x + width / 2}
        y={y - 6}
        fill="#9ca3af"
        fontSize={11}
        textAnchor="middle"
      >
        {total}h
      </text>
    );
  };

  return (
    <div>
      <h2 className="text-base font-semibold mb-5">Hours by Person + Role</h2>
      {data.length === 0 ? (
        <p className="text-sm" style={{ color: "#6b7280" }}>
          No data for selected range.
        </p>
      ) : (
        <ResponsiveContainer width="100%" height={420}>
          <BarChart data={data} margin={{ top: 24, right: 24, left: 0, bottom: 24 }}>
            <XAxis
              dataKey="user"
              tick={{ fill: "#9ca3af", fontSize: 12 }}
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
            {allRoles.map((role, i) => (
              <Bar key={role} dataKey={role} stackId="a" fill={colorFor(role)}>
                {i === allRoles.length - 1 && (
                  <LabelList dataKey={role} content={<CustomLabel />} />
                )}
              </Bar>
            ))}
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
