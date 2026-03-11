"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { TimeEntry } from "../types";
import { groupBy, uniqueValues, msToHours, weekCommencing } from "../utils";

interface Props {
  entries: TimeEntry[];
}

const CATEGORY_COLORS: Record<string, string> = {
  automatable: "#f59e0b",
  strategic: "#6366f1",
  other: "#6b7280",
};

const WEEK_COLORS: Record<string, string> = {
  automatable: "#f59e0b",
  strategic: "#6366f1",
};

export default function AutomatableView({ entries }: Props) {
  const allUsers = uniqueValues(entries.map((e) => e.user.username)).sort();
  const byUser = groupBy(entries, (e) => e.user.username);

  return (
    <div>
      <h2 className="text-base font-semibold mb-6">Automatable vs Strategic Split</h2>
      <div className="grid gap-8">
        {allUsers.map((user) => {
          const userEntries = byUser[user] ?? [];
          const automatable = userEntries.filter((e) => e.taskCategory === "automatable");
          const strategic = userEntries.filter((e) => e.taskCategory === "strategic");
          const totalMs = userEntries.reduce((s, e) => s + e.duration, 0);

          const donutData = [
            {
              name: "Automatable",
              value: parseFloat(msToHours(automatable.reduce((s, e) => s + e.duration, 0)).toFixed(2)),
              cat: "automatable",
            },
            {
              name: "Strategic",
              value: parseFloat(msToHours(strategic.reduce((s, e) => s + e.duration, 0)).toFixed(2)),
              cat: "strategic",
            },
          ].filter((d) => d.value > 0);

          // Weekly trend
          const byWeek = groupBy(userEntries, (e) => weekCommencing(e.start));
          const weeks = Object.keys(byWeek).sort();
          const weekData = weeks.map((week) => {
            const we = byWeek[week];
            return {
              week,
              automatable: parseFloat(
                msToHours(
                  we.filter((e) => e.taskCategory === "automatable").reduce((s, e) => s + e.duration, 0)
                ).toFixed(2)
              ),
              strategic: parseFloat(
                msToHours(
                  we.filter((e) => e.taskCategory === "strategic").reduce((s, e) => s + e.duration, 0)
                ).toFixed(2)
              ),
            };
          });

          // Top automatable tasks
          const autoByTask = groupBy(automatable, (e) => e.task.name);
          const topAutoTasks = Object.entries(autoByTask)
            .map(([name, te]) => ({
              name,
              hours: msToHours(te.reduce((s, e) => s + e.duration, 0)),
            }))
            .sort((a, b) => b.hours - a.hours)
            .slice(0, 5);

          const maxTaskHours = topAutoTasks[0]?.hours ?? 1;

          return (
            <div
              key={user}
              className="rounded-lg p-5"
              style={{ background: "#131313", border: "1px solid #222" }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-sm">{user}</h3>
                <span className="text-xs" style={{ color: "#6b7280" }}>
                  {msToHours(totalMs).toFixed(1)}h total
                </span>
              </div>

              <div className="grid grid-cols-2 gap-6">
                {/* Donut */}
                <div>
                  <div className="text-xs mb-2" style={{ color: "#6b7280" }}>
                    Split
                  </div>
                  {donutData.length > 0 ? (
                    <PieChart width={200} height={200}>
                      <Pie
                        data={donutData}
                        cx={100}
                        cy={100}
                        innerRadius={55}
                        outerRadius={85}
                        dataKey="value"
                        paddingAngle={2}
                      >
                        {donutData.map((entry) => (
                          <Cell
                            key={entry.cat}
                            fill={CATEGORY_COLORS[entry.cat]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          background: "#1a1a1a",
                          border: "1px solid #333",
                          borderRadius: 6,
                          fontSize: 12,
                        }}
                        formatter={(v: unknown) => [`${(v as number).toFixed(1)}h`]}
                      />
                    </PieChart>
                  ) : (
                    <p className="text-xs" style={{ color: "#6b7280" }}>
                      No data
                    </p>
                  )}
                  <div className="flex gap-3 mt-1">
                    {donutData.map((d) => (
                      <div key={d.cat} className="flex items-center gap-1.5">
                        <span
                          className="w-2 h-2 rounded-full inline-block"
                          style={{ background: CATEGORY_COLORS[d.cat] }}
                        />
                        <span className="text-xs" style={{ color: "#9ca3af" }}>
                          {d.name} {d.value.toFixed(1)}h
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Weekly stacked bar */}
                <div>
                  <div className="text-xs mb-2" style={{ color: "#6b7280" }}>
                    Weekly trend
                  </div>
                  {weekData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart
                        data={weekData}
                        margin={{ top: 4, right: 4, left: -20, bottom: 4 }}
                      >
                        <XAxis
                          dataKey="week"
                          tick={{ fill: "#6b7280", fontSize: 10 }}
                          axisLine={false}
                          tickLine={false}
                          tickFormatter={(v: string) => v.slice(5)}
                        />
                        <YAxis
                          tick={{ fill: "#6b7280", fontSize: 10 }}
                          axisLine={false}
                          tickLine={false}
                          tickFormatter={(v) => `${v}h`}
                        />
                        <Tooltip
                          contentStyle={{
                            background: "#1a1a1a",
                            border: "1px solid #333",
                            borderRadius: 6,
                            fontSize: 11,
                          }}
                          formatter={(v: unknown) => [`${(v as number).toFixed(1)}h`]}
                        />
                        <Bar dataKey="automatable" stackId="a" fill={WEEK_COLORS.automatable} />
                        <Bar dataKey="strategic" stackId="a" fill={WEEK_COLORS.strategic} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-xs" style={{ color: "#6b7280" }}>
                      No data
                    </p>
                  )}
                </div>
              </div>

              {/* Top automatable tasks */}
              {topAutoTasks.length > 0 && (
                <div className="mt-5">
                  <div className="text-xs mb-3" style={{ color: "#6b7280" }}>
                    Top automatable tasks
                  </div>
                  <div className="space-y-2">
                    {topAutoTasks.map((task) => (
                      <div key={task.name}>
                        <div className="flex justify-between text-xs mb-1">
                          <span
                            className="truncate pr-3"
                            style={{ color: "#d1d5db", maxWidth: "75%" }}
                            title={task.name}
                          >
                            {task.name}
                          </span>
                          <span style={{ color: "#9ca3af" }}>
                            {task.hours.toFixed(1)}h
                          </span>
                        </div>
                        <div
                          className="h-1 rounded-full overflow-hidden"
                          style={{ background: "#222" }}
                        >
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${(task.hours / maxTaskHours) * 100}%`,
                              background: "#f59e0b",
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
