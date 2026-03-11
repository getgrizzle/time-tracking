"use client";

import { DateRange, DatePreset } from "../types";

const PRESETS: { id: DatePreset; label: string }[] = [
  { id: "7d", label: "Last 7 days" },
  { id: "30d", label: "Last 30 days" },
  { id: "90d", label: "Last 90 days" },
  { id: "custom", label: "Custom" },
];

interface Props {
  value: DateRange;
  onChange: (r: DateRange) => void;
}

function toInputDate(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10);
}

function fromInputDate(s: string): number {
  return new Date(s).getTime();
}

export default function DateRangePicker({ value, onChange }: Props) {
  const now = Date.now();

  function handlePreset(preset: DatePreset) {
    if (preset === "7d")
      onChange({ start: now - 7 * 864e5, end: now, preset });
    else if (preset === "30d")
      onChange({ start: now - 30 * 864e5, end: now, preset });
    else if (preset === "90d")
      onChange({ start: now - 90 * 864e5, end: now, preset });
    else onChange({ ...value, preset: "custom" });
  }

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <div
        className="flex rounded overflow-hidden"
        style={{ border: "1px solid #333" }}
      >
        {PRESETS.filter((p) => p.id !== "custom").map((p) => (
          <button
            key={p.id}
            onClick={() => handlePreset(p.id)}
            className="px-3 py-1.5 text-xs transition-colors"
            style={{
              background: value.preset === p.id ? "#6366f1" : "#131313",
              color: value.preset === p.id ? "#fff" : "#9ca3af",
              borderRight: "1px solid #333",
            }}
          >
            {p.label}
          </button>
        ))}
        <button
          onClick={() => handlePreset("custom")}
          className="px-3 py-1.5 text-xs transition-colors"
          style={{
            background: value.preset === "custom" ? "#6366f1" : "#131313",
            color: value.preset === "custom" ? "#fff" : "#9ca3af",
          }}
        >
          Custom
        </button>
      </div>

      {value.preset === "custom" && (
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={toInputDate(value.start)}
            onChange={(e) =>
              onChange({ ...value, start: fromInputDate(e.target.value) })
            }
            className="px-2 py-1.5 text-xs rounded"
            style={{
              background: "#131313",
              border: "1px solid #333",
              color: "#e5e7eb",
            }}
          />
          <span className="text-xs" style={{ color: "#6b7280" }}>
            to
          </span>
          <input
            type="date"
            value={toInputDate(value.end)}
            onChange={(e) =>
              onChange({ ...value, end: fromInputDate(e.target.value) })
            }
            className="px-2 py-1.5 text-xs rounded"
            style={{
              background: "#131313",
              border: "1px solid #333",
              color: "#e5e7eb",
            }}
          />
        </div>
      )}
    </div>
  );
}
