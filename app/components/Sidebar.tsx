"use client";

type View = "by-person" | "trends" | "by-client" | "automatable";

const NAV_ITEMS: { id: View; label: string }[] = [
  { id: "by-person", label: "Hours by Person" },
  { id: "trends", label: "Week-on-Week Trends" },
  { id: "by-client", label: "Hours by Client" },
  { id: "automatable", label: "Automatable vs Strategic" },
];

interface Props {
  activeView: View;
  onViewChange: (v: View) => void;
}

export default function Sidebar({ activeView, onViewChange }: Props) {
  return (
    <aside
      className="w-56 shrink-0 flex flex-col"
      style={{ background: "#131313", borderRight: "1px solid #222" }}
    >
      <div className="px-5 py-5 border-b" style={{ borderColor: "#222" }}>
        <div className="text-sm font-semibold text-white tracking-wide uppercase">
          Grizzle
        </div>
        <div className="text-xs mt-0.5" style={{ color: "#6b7280" }}>
          Time Tracking
        </div>
      </div>
      <nav className="flex-1 py-4">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className="w-full text-left px-5 py-2.5 text-sm transition-colors"
            style={{
              color: activeView === item.id ? "#fff" : "#9ca3af",
              background:
                activeView === item.id ? "rgba(255,255,255,0.05)" : "transparent",
              borderRight:
                activeView === item.id ? "2px solid #6366f1" : "2px solid transparent",
            }}
          >
            {item.label}
          </button>
        ))}
      </nav>
    </aside>
  );
}
